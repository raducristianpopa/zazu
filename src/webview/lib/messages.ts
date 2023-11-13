import { ExtensionMessage, WalletAddressAddPayload, WebviewMessage } from "#shared/types";
import { WebviewApi } from "vscode-webview";
import { setWalletAddresses } from "./state";
import { VSCodeAPIWrapper, vscode } from "./vscode";

export function listWalletAddresses(): void {
    vscode.postMessage({
        action: "WALLET_ADDRESS_LIST",
    });
}

export function addWalletAddress(payload: WalletAddressAddPayload): void {
    vscode.postMessage({
        action: "WALLET_ADDRESS_ADD",
        payload,
    });
}

export function requestGrant(walletAddressUrl: string): void {
    vscode.postMessage({
        action: "REQUEST_GRANT",
        payload: {
            walletAddressUrl,
        },
    });
}

export function continueGrant(walletAddressUrl: string, interactRef: string): void {
    vscode.postMessage({
        action: "CONTINUE_GRANT",
        payload: {
            walletAddressUrl,
            interactRef,
        },
    });
}

export function send() {
    vscode.postMessage({
        action: "SEND",
    });
}

export function messageHandler(event: MessageEvent<ExtensionMessage>) {
    const { action, payload } = event.data;

    console.group("Received message");
    console.log("Action:", action);
    console.log("Payload:", payload);
    console.groupEnd();

    switch (action) {
        case "WALLET_ADDRESS_LIST":
            setWalletAddresses(payload);
    }
}

export class Messages {
    private static vscode: WebviewApi<unknown>;
    private static promises: Map<string, any> = new Map<string, any>();

    public static get api(): WebviewApi<unknown> {
        if (typeof acquireVsCodeApi !== "function") {
            throw new Error(
                `Could not get VSCode API. "acquireVsCodeApi" is not function, received: ${typeof acquireVsCodeApi}.`,
            );
        }

        if (!vscode) {
            Messages.vscode = acquireVsCodeApi();
        }

        return Messages.vscode;
    }

    static send(message: WebviewMessage) {
        this.api.postMessage(message);
    }

    static async post(message: WebviewMessage, key?: string) {
        if (key) {
            this.promises.set(key, null);
        }

        return new Promise((res, rej) => {
        })
        this.api.postMessage({ ...message, key });
    }
}
