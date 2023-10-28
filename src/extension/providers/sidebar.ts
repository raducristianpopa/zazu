import { nonce, uri } from "#extension/utils";
import { ExtensionMessage, WebviewMessage } from "#shared/types";
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
import { WalletAddressManager } from "#extension/managers/wallet-address";

interface SidebarProviderDeps {
    extensionUri: Uri;
    walletAddressManager: WalletAddressManager;
    secretStorage: SecretStorage;
}

export class SidebarProvider implements WebviewViewProvider {
    public static readonly viewType = "zazu-sidebar-view";

    private readonly extensionUri: Uri;
    private walletAddressManager: WalletAddressManager;
    private secretStorage: SecretStorage;

    constructor(deps: SidebarProviderDeps) {
        this.extensionUri = deps.extensionUri;
        this.walletAddressManager = deps.walletAddressManager;
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
        const scriptUri = uri(webview, extensionUri, ["dist", "webview", "main.js"]);
        const stylesUri = uri(webview, extensionUri, ["dist", "webview", "main.css"]);
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
                case "WALLET_ADDRESS_LIST":
                    this.postMessage(webviewView.webview, {
                        action: "WALLET_ADDRESS_LIST",
                        payload: this.walletAddressManager.list(),
                    });
                    break;
                case "WALLET_ADDRESS_ADD":
                    const payload = await this.walletAddressManager.set(message.payload);
                    this.postMessage(webviewView.webview, {
                        action: "WALLET_ADDRESS_LIST",
                        payload,
                    });
                    window.showInformationMessage(`Wallet address "${message.payload.walletAddressUrl}" was added.`);
                    break;
                case "REQUEST_GRANT":
                    const grant = await this.walletAddressManager.grant(message.payload.walletAddressUrl);
                    env.openExternal(Uri.parse(grant.interact.redirect));
                    this.postMessage(webviewView.webview, {
                        action: "WALLET_ADDRESS_LIST",
                        payload: this.walletAddressManager.list(),
                    });
                    break;
                case "CONTINUE_GRANT":
                    await this.walletAddressManager.continue(
                        message.payload.walletAddressUrl,
                        message.payload.interactRef,
                    );
                    this.postMessage(webviewView.webview, {
                        action: "WALLET_ADDRESS_LIST",
                        payload: this.walletAddressManager.list(),
                    });
                    break;
                case "SEND":
                    console.log("Sending ... not implemented");
                    break;
            }
        });
    }
}
