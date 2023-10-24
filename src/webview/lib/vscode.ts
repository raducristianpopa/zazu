import { ExtensionAction, ExtensionMessage, WebviewMessage } from "#types";
import type { WebviewApi } from "vscode-webview";
import { setPaymentPointers } from "./state";

class VSCodeAPIWrapper {
    private readonly vsCodeApi: WebviewApi<unknown> | undefined;

    constructor() {
        if (typeof acquireVsCodeApi === "function") {
            this.vsCodeApi = acquireVsCodeApi();
        }
    }

    public postMessage(message: WebviewMessage) {
        if (this.vsCodeApi) {
            this.vsCodeApi.postMessage(message);
        } else {
            console.log(message);
        }
    }

    public getState(): unknown | undefined {
        if (this.vsCodeApi) {
            return this.vsCodeApi.getState();
        } else {
            const state = localStorage.getItem("vscodeState");
            return state ? JSON.parse(state) : undefined;
        }
    }

    public setState<T extends unknown | undefined>(newState: T): T {
        if (this.vsCodeApi) {
            return this.vsCodeApi.setState(newState);
        } else {
            localStorage.setItem("vscodeState", JSON.stringify(newState));
            return newState;
        }
    }
}

// Exports class singleton to prevent multiple invocations of acquireVsCodeApi.
export const vscode = new VSCodeAPIWrapper();
