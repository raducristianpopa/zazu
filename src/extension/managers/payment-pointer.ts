import { PaymentPointer, PaymentPointerStatus } from "#shared/types";
import { nonce } from "#extension/utils";
import { UnauthenticatedClient, createAuthenticatedClient, isPendingGrant } from "@interledger/open-payments";
import { Memento, SecretStorage } from "vscode";

export class PaymentPointerManager {
    private readonly stateKey: string = "payment-pointers";
    constructor(
        private memento: Memento,
        private secrets: SecretStorage,
        private sdk: UnauthenticatedClient,
    ) {
        // const keys = this.memento.keys();
        // for (const key of keys) {
        //     this.memento.update(key, undefined);
        // }
    }

    async update(paymentPointerUrl: string, data?: Partial<Omit<PaymentPointer, "id">>) {
        const paymentPointer = this.find(paymentPointerUrl);
        if (!paymentPointer) {
            throw new Error("Payment pointer not found");
        }
        const paymentPointers = this.list();
        const index = paymentPointers.findIndex(x => x.id === paymentPointer.id);
        if (index === -1) {
            throw new Error("Payment pointer not found");
        }
        paymentPointers[index] = {
            ...paymentPointer,
            ...data,
        };
        await this.memento.update(this.stateKey, paymentPointers);
    }

    // async updateStatus(paymentPointerUrl: string, status: PaymentPointerStatus): Promise<void> {
    //     const paymentPointer = this.find(paymentPointerUrl);
    //     if (!paymentPointer) {
    //         throw new Error("Payment pointer not found");
    //     }
    //     paymentPointer.status = status;
    //     const paymentPointers = this.list();
    //     const index = paymentPointers.findIndex(x => x.id === paymentPointer.id);
    //     if (index === -1) {
    //         throw new Error("Payment pointer not found");
    //     }
    //     paymentPointers[index] = paymentPointer;
    //     await this.memento.update(this.stateKey, paymentPointers);
    // }

    list(): PaymentPointer[] {
        return this.memento.get<PaymentPointer[]>(this.stateKey) ?? [];
    }

    find(id: string): PaymentPointer | undefined {
        const paymentPointers = this.list();
        return paymentPointers.find(paymentPointer => paymentPointer.id === id);
    }

    exists(url: string): boolean {
        return Boolean(this.list().find(s => s.id === url));
    }

    async set({
        paymentPointer,
        keyId,
        privateKey,
    }: {
        paymentPointer: string;
        keyId: string;
        privateKey: string;
    }): Promise<PaymentPointer[]> {
        const paymentPointerInfo = await this.sdk.paymentPointer
            .get({
                url: paymentPointer,
            })
            .catch(() => {
                throw new Error("Could not fetch payment pointer information");
            });

        const paymentPointers = this.list();
        paymentPointers.push({ ...paymentPointerInfo, status: "NEEDS_GRANT" });

        await this.memento.update(this.stateKey, paymentPointers);
        await this.secrets.store(
            paymentPointerInfo.id,
            JSON.stringify({
                keyId,
                privateKey,
            }),
        );

        return paymentPointers;
    }

    async send() {
        const paymentPointerUrl = "https://ilp.rafiki.money/radu";
        const paymentPointerSecretsJSON = await this.secrets.get(paymentPointerUrl);
        if (!paymentPointerSecretsJSON) {
            throw new Error(`Missing key ID and private key for ${paymentPointerUrl}`);
        }
        const paymentPointerSecrets = JSON.parse(paymentPointerSecretsJSON) as {
            keyId: string;
            privateKey: string;
        };

        const tokenJSON = await this.secrets.get(`token:${paymentPointerUrl}`);
        if (!tokenJSON) {
            throw new Error(`Missing token information key for ${paymentPointerUrl}`);
        }
        const token = JSON.parse(tokenJSON) as {
            token: string;
            manageURL: string;
        };

        const client = await createAuthenticatedClient({
            paymentPointerUrl,
            keyId: paymentPointerSecrets.keyId,
            privateKey: Buffer.from(paymentPointerSecrets.privateKey, "utf8"),
        });

        const rotated = await client.token.rotate({
            url: token.manageURL,
            accessToken: token.token,
        });

        await this.secrets.store(
            `token:${paymentPointerUrl}`,
            JSON.stringify({
                token: rotated.access_token.value,
                manageURL: rotated.access_token.manage,
            }),
        );

        const incomingGrant = await client.grant.request(
            {
                url: "https://auth.rafiki.money/",
            },
            {
                access_token: {
                    access: [
                        {
                            type: "incoming-payment",
                            actions: ["list", "list-all", "read", "read-all", "complete", "create"],
                            identifier: paymentPointerUrl,
                        },
                    ],
                },
            },
        );

        if (isPendingGrant(incomingGrant)) {
            throw new Error("Expected non-interactive grant");
        }

        const incomingPayment = await client.incomingPayment.create(
            {
                accessToken: incomingGrant.access_token.value,
                paymentPointer: paymentPointerUrl,
            },
            {
                incomingAmount: {
                    assetCode: "USD",
                    assetScale: 2,
                    value: "1000",
                },
            },
        );

        const quoteGrant = await client.grant.request(
            {
                url: "https://auth.rafiki.money/",
            },
            {
                access_token: {
                    access: [
                        {
                            type: "quote",
                            actions: ["create"],
                        },
                    ],
                },
            },
        );

        if (isPendingGrant(quoteGrant)) {
            throw new Error("Expected non-interactive grant");
        }

        const quote = await client.quote.create(
            {
                accessToken: quoteGrant.access_token.value,
                paymentPointer: paymentPointerUrl,
            },
            {
                receiver: incomingPayment.id,
            },
        );

        const outgoingPayment = await client.outgoingPayment.create(
            {
                accessToken: rotated.access_token.value,
                paymentPointer: paymentPointerUrl,
            },
            {
                quoteId: quote.id,
            },
        );

        console.log(outgoingPayment);
    }

    async grant(paymentPointerUrl: string) {
        console.log(paymentPointerUrl);
        const paymentPointer = this.find(paymentPointerUrl);
        console.log(paymentPointer);
        if (!paymentPointer) {
            throw new Error("Payment pointer was not added to Zazu");
        }

        const paymentPointerSecretsJSON = await this.secrets.get(paymentPointerUrl);
        if (!paymentPointerSecretsJSON) {
            throw new Error(`Missing key ID and private key for ${paymentPointerUrl}`);
        }

        const paymentPointerSecrets = JSON.parse(paymentPointerSecretsJSON) as {
            keyId: string;
            privateKey: string;
        };

        console.log(paymentPointer);

        const client = await createAuthenticatedClient({
            paymentPointerUrl,
            keyId: paymentPointerSecrets.keyId,
            privateKey: Buffer.from(paymentPointerSecrets.privateKey, "utf8"),
        });

        const grant = await client.grant.request(
            {
                url: paymentPointer.authServer,
            },
            {
                access_token: {
                    access: [
                        {
                            type: "outgoing-payment",
                            actions: ["create"],
                            identifier: paymentPointer.id,
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

        this.update(paymentPointer.id, {
            status: "WAITING_FOR_APPROVAL",
            continueToken: grant.continue.access_token.value,
            continueUri: grant.continue.uri,
        });
        return grant;
    }

    async continue(paymentPointerUrl: string, interactRef: string) {
        console.log(paymentPointerUrl);
        const paymentPointer = this.find(paymentPointerUrl);
        console.log(paymentPointer);

        if (!paymentPointer) {
            throw new Error("Payment pointer was not added to Zazu");
        }

        if (!paymentPointer.continueToken || !paymentPointer.continueUri) {
            throw new Error(`Missing continuation token and URI for ${paymentPointer.id}.`);
        }

        const paymentPointerSecretsJSON = await this.secrets.get(paymentPointerUrl);
        if (!paymentPointerSecretsJSON) {
            throw new Error(`Missing key ID and private key for ${paymentPointerUrl}`);
        }

        const paymentPointerSecrets = JSON.parse(paymentPointerSecretsJSON) as {
            keyId: string;
            privateKey: string;
        };

        const client = await createAuthenticatedClient({
            paymentPointerUrl,
            keyId: paymentPointerSecrets.keyId,
            privateKey: paymentPointerSecrets.privateKey,
        });

        const continuation = await client.grant.continue(
            {
                accessToken: paymentPointer.continueToken,
                url: paymentPointer.continueUri,
            },
            {
                interact_ref: interactRef,
            },
        );

        await this.secrets.store(
            `token:${paymentPointer.id}`,
            JSON.stringify({
                token: continuation.access_token.value,
                manageURL: continuation.access_token.manage,
            }),
        );
        await this.update(paymentPointer.id, {
            status: "ACTIVE",
            continueToken: undefined,
            continueUri: undefined,
        });
        console.log(continuation);
    }
}
