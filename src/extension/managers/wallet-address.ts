import { WalletAddress } from "#shared/types";
import { nonce } from "#extension/utils";
import { UnauthenticatedClient, createAuthenticatedClient, isPendingGrant } from "@interledger/open-payments";
import { Memento, SecretStorage } from "vscode";

export class WalletAddressManager {
    private readonly stateKey: string = "wallet-addresses";
    constructor(
        private memento: Memento,
        private secrets: SecretStorage,
        private sdk: UnauthenticatedClient,
    ) {
        const keys = this.memento.keys();
        for (const key of keys) {
            this.memento.update(key, undefined);
        }
    }

    async update(walletAddressUrl: string, data?: Partial<Omit<WalletAddress, "id">>) {
        const walletAddress = this.find(walletAddressUrl);
        if (!walletAddress) {
            throw new Error("Wallet address not found");
        }
        const walletAddresses = this.list();
        const index = walletAddresses.findIndex(wa => wa.id === walletAddress.id);
        if (index === -1) {
            throw new Error("Wallet address not found");
        }
        walletAddresses[index] = {
            ...walletAddress,
            ...data,
        };
        await this.memento.update(this.stateKey, walletAddresses);
    }

    list(): WalletAddress[] {
        return this.memento.get<WalletAddress[]>(this.stateKey) ?? [];
    }

    find(walletAddressUrl: string): WalletAddress | undefined {
        const walletAddresses = this.list();
        return walletAddresses.find(wa => wa.id === walletAddressUrl);
    }

    exists(walletAddressUrl: string): boolean {
        return Boolean(this.list().find(wa => wa.id === walletAddressUrl));
    }

    async set({
        walletAddressUrl,
        keyId,
        privateKey,
    }: {
        walletAddressUrl: string;
        keyId: string;
        privateKey: string;
    }): Promise<WalletAddress[]> {
        const walletAddressInfo = await this.sdk.paymentPointer
            .get({
                url: walletAddressUrl,
            })
            .catch(() => {
                throw new Error("Could not fetch Wallet address information");
            });

        const walletAddresses = this.list();
        walletAddresses.push({ ...walletAddressInfo, status: "NEEDS_GRANT" });

        await this.memento.update(this.stateKey, walletAddresses);
        await this.secrets.store(
            walletAddressInfo.id,
            JSON.stringify({
                keyId,
                privateKey,
            }),
        );

        return walletAddresses;
    }

    async grant(walletAddressUrl: string) {
        console.log(walletAddressUrl);
        const walletAddress = this.find(walletAddressUrl);
        console.log(walletAddress);
        if (!walletAddress) {
            throw new Error("Wallet address was not added to Zazu");
        }

        const walletAddressSecretsJSON = await this.secrets.get(walletAddressUrl);
        if (!walletAddressSecretsJSON) {
            throw new Error(`Missing key ID and private key for ${walletAddressUrl}`);
        }

        const walletAddressSecrets = JSON.parse(walletAddressSecretsJSON) as {
            keyId: string;
            privateKey: string;
        };

        console.log(walletAddress);

        const client = await createAuthenticatedClient({
            paymentPointerUrl: walletAddressUrl,
            keyId: walletAddressSecrets.keyId,
            privateKey: Buffer.from(walletAddressSecrets.privateKey, "utf8"),
        });

        const grant = await client.grant.request(
            {
                url: walletAddress.authServer,
            },
            {
                access_token: {
                    access: [
                        {
                            type: "outgoing-payment",
                            actions: ["create"],
                            identifier: walletAddress.id,
                        },
                    ],
                },
                interact: {
                    start: ["redirect"],
                    finish: {
                        method: "redirect",
                        nonce: nonce(),
                        uri: "http://localhost:3000",
                    },
                },
            },
        );

        if (!isPendingGrant(grant)) {
            throw new Error("Received non-interactive grant");
        }

        this.update(walletAddress.id, {
            status: "WAITING_FOR_APPROVAL",
            continueToken: grant.continue.access_token.value,
            continueUri: grant.continue.uri,
        });
        return grant;
    }

    async continue(walletAddressUrl: string, interactRef: string) {
        console.log(walletAddressUrl);
        const walletAddress = this.find(walletAddressUrl);
        console.log(walletAddress);

        if (!walletAddress) {
            throw new Error("Wallet address was not added to Zazu");
        }

        if (!walletAddress.continueToken || !walletAddress.continueUri) {
            throw new Error(`Missing continuation token and URI for ${walletAddress.id}.`);
        }

        const walletAddressSecretsJSON = await this.secrets.get(walletAddressUrl);
        if (!walletAddressSecretsJSON) {
            throw new Error(`Missing key ID and private key for ${walletAddressUrl}`);
        }

        const walletAddressSecrets = JSON.parse(walletAddressSecretsJSON) as {
            keyId: string;
            privateKey: string;
        };

        const client = await createAuthenticatedClient({
            paymentPointerUrl: walletAddressUrl,
            keyId: walletAddressSecrets.keyId,
            privateKey: walletAddressSecrets.privateKey,
        });

        const continuation = await client.grant.continue(
            {
                accessToken: walletAddress.continueToken,
                url: walletAddress.continueUri,
            },
            {
                interact_ref: interactRef,
            },
        );

        await this.secrets.store(
            `token:${walletAddress.id}`,
            JSON.stringify({
                token: continuation.access_token.value,
                manageURL: continuation.access_token.manage,
            }),
        );
        await this.update(walletAddress.id, {
            status: "ACTIVE",
            continueToken: undefined,
            continueUri: undefined,
        });
        console.log(continuation);
    }
}
