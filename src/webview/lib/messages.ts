import { ExtensionMessage, WalletAddressAddPayload } from "#shared/types";
import { setWalletAddresses } from "./state";
import { vscode } from "./vscode";

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
