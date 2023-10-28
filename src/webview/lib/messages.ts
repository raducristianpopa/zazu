import { ExtensionAction, ExtensionMessage, PaymentPointerAddPayload } from "#shared/types";
import { setPaymentPointers } from "./state";
import { vscode } from "./vscode";

export function listPaymentPointers(): void {
    vscode.postMessage({
        action: "PAYMENT_POINTER_LIST",
    });
}

export function addPaymentPointer(payload: PaymentPointerAddPayload): void {
    vscode.postMessage({
        action: "PAYMENT_POINTER_ADD",
        payload,
    });
}

export function requestGrant(paymentPointer: string): void {
    vscode.postMessage({
        action: "REQUEST_GRANT",
        payload: {
            paymentPointer,
        },
    });
}

export function continueGrant(paymentPointer: string, interactRef: string): void {
    vscode.postMessage({
        action: "CONTINUE_GRANT",
        payload: {
            paymentPointer,
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
        case ExtensionAction.PAYMENT_POINTER_LIST:
            setPaymentPointers(payload);
    }
}
