import { nonce, uri } from "#utils";
import { ExtensionMessage, WebviewMessage } from "#types";
import {
    env,
    commands,
    CancellationToken,
    SecretStorage,
    Uri,
    Webview,
    WebviewView,
    WebviewViewProvider,
    WebviewViewResolveContext,
    window,
} from "vscode";
import { PaymentPointerManager } from "#managers/payment-pointer";

interface SidebarProviderDeps {
    extensionUri: Uri;
    paymentPointerManager: PaymentPointerManager;
    secretStorage: SecretStorage;
}

export class SidebarProvider implements WebviewViewProvider {
    public static readonly viewType = "zazu-sidebar-view";

    private readonly extensionUri: Uri;
    private paymentPointerManager: PaymentPointerManager;
    private secretStorage: SecretStorage;

    constructor(deps: SidebarProviderDeps) {
        this.extensionUri = deps.extensionUri;
        this.paymentPointerManager = deps.paymentPointerManager;
        this.secretStorage = deps.secretStorage;
    }

    public resolveWebviewView(
        webviewView: WebviewView,
        _context: WebviewViewResolveContext<unknown>,
        _token: CancellationToken,
    ): void | Thenable<void> {
        webviewView.webview.options = {
            enableScripts: true,
            enableForms: true,
            localResourceRoots: [Uri.joinPath(this.extensionUri, "dist")],
        };
        webviewView.webview.html = this.getWebviewContent(webviewView.webview, this.extensionUri);
        this.setWebviewMessageListener(webviewView);
    }

    private getWebviewContent(webview: Webview, extensionUri: Uri) {
        const scriptUri = uri(webview, extensionUri, ["dist", "webviews", "main.js"]);
        const stylesUri = uri(webview, extensionUri, ["dist", "webviews", "main.css"]);
        const n = nonce();

        return /*html*/ `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${n}';">
                <link type="text/css" nonce="${n}" href="${stylesUri}" rel="stylesheet">
            </head>
            <body>
                <script nonce="${n}" src="${scriptUri}"></script>
            </body>
            </html>`;
    }

    private postMessage(webview: Webview, message: ExtensionMessage) {
        webview.postMessage(message);
    }

    private setWebviewMessageListener(webviewView: WebviewView) {
        webviewView.webview.onDidReceiveMessage(async (message: WebviewMessage) => {
            switch (message.action) {
                case "PAYMENT_POINTER_LIST":
                    this.postMessage(webviewView.webview, {
                        action: "PAYMENT_POINTER_LIST",
                        payload: this.paymentPointerManager.list(),
                    });
                    break;
                case "PAYMENT_POINTER_ADD":
                    const payload = await this.paymentPointerManager.set(message.payload);
                    this.postMessage(webviewView.webview, {
                        action: "PAYMENT_POINTER_LIST",
                        payload,
                    });
                    window.showInformationMessage(`Payment pointer "${message.payload.paymentPointer}" was added.`);
                    break;
                case "REQUEST_GRANT":
                    const grant = await this.paymentPointerManager.grant(message.payload.paymentPointer);
                    env.openExternal(Uri.parse(grant.interact.redirect));
                    this.postMessage(webviewView.webview, {
                        action: "PAYMENT_POINTER_LIST",
                        payload: this.paymentPointerManager.list(),
                    });
                    break;
                case "CONTINUE_GRANT":
                    await this.paymentPointerManager.continue(
                        message.payload.paymentPointer,
                        message.payload.interactRef,
                    );
                    this.postMessage(webviewView.webview, {
                        action: "PAYMENT_POINTER_LIST",
                        payload: this.paymentPointerManager.list(),
                    });
                    break;
                case "SEND":
                    await this.paymentPointerManager.send();
                    break;
            }
        });
    }
}
