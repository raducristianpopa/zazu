import {
    ExtensionAction,
    ExtensionActionPayload,
    ExtensionMessage,
    MessageResponse,
    WalletAddressAddPayload,
    WebviewMessage,
} from "#shared/types";
import { WebviewApi } from "vscode-webview";
import { setWalletAddresses } from "./state";
import { nonce } from "#shared/utils";

export function listWalletAddresses(): void {
    Messages.send({
        action: "WALLET_ADDRESS_LIST",
    });
}

export function addWalletAddress(payload: WalletAddressAddPayload): void {
    Messages.send({
        action: "WALLET_ADDRESS_ADD",
        payload,
    });
}

export function requestGrant(walletAddressUrl: string): void {
    Messages.send({
        action: "REQUEST_GRANT",
        payload: {
            walletAddressUrl,
        },
    });
}

export function continueGrant(walletAddressUrl: string, interactRef: string): void {
    Messages.send({
        action: "CONTINUE_GRANT",
        payload: {
            walletAddressUrl,
            interactRef,
        },
    });
}

export function send() {
    Messages.send({
        action: "SEND",
    });
}

export function messageHandler(event: MessageEvent<ExtensionMessage>) {
    const { id, action, payload, error } = event.data;

    if (id) {
        const promise = Messages.promises.get(id);
        if (promise) {
            promise.res({ success: !error, payload, error });
            Messages.promises.delete(id);
        }
        return;
    }

    console.group("Received message");
    console.log("Action:", action);
    console.log("Payload:", payload);
    console.groupEnd();

    switch (action) {
        case "WALLET_ADDRESS_LIST":
            setWalletAddresses(payload);
    }
}

type PostResponse<TMessage extends WebviewMessage> = Promise<
    MessageResponse<TMessage["action"] extends ExtensionAction ? ExtensionActionPayload[TMessage["action"]] : undefined>
>;

export class Messages {
    private static vscode: WebviewApi<unknown>;
    public static promises: Map<string, { res: (_0: any) => void }> = new Map();

    private static mId(): string {
        return "M_" + nonce();
    }

    public static get api(): WebviewApi<unknown> {
        if (typeof acquireVsCodeApi !== "function") {
            throw new Error(
                `Could not get VSCode API. "acquireVsCodeApi" is not function, received: ${typeof acquireVsCodeApi}.`,
            );
        }

        if (!this.vscode) {
            this.vscode = acquireVsCodeApi();
        }

        return this.vscode;
    }

    static send(message: WebviewMessage): void {
        this.api.postMessage(message);
    }

    static async post<TMessage extends WebviewMessage>(message: TMessage): PostResponse<TMessage> {
        return new Promise(res => {
            message.id = this.mId();
            this.promises.set(message.id, { res });
            this.send(message);
        });
    }
}
