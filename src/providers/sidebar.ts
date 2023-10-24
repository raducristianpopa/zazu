import { nonce, uri } from '#utils';
import { ExtensionMessage, WebviewMessage } from '#types';
import { StateManager } from '#managers/state-manager';
import {
	CancellationToken,
	SecretStorage,
	Uri,
	Webview,
	WebviewView,
	WebviewViewProvider,
	WebviewViewResolveContext,
	window
} from 'vscode';
import { createUnauthenticatedClient } from '@interledger/open-payments';

interface SidebarProviderDeps {
	extensionUri: Uri;
	secretStorage: SecretStorage;
	state: StateManager;
}

export class SidebarProvider implements WebviewViewProvider {
	public static readonly viewType = 'zazu-sidebar-view';

	private readonly extensionUri: Uri;
	private secretStorage: SecretStorage;
	private state: StateManager;

	constructor(deps: SidebarProviderDeps) {
		this.extensionUri = deps.extensionUri;
		this.secretStorage = deps.secretStorage;
		this.state = deps.state;
	}

	public resolveWebviewView(
		webviewView: WebviewView,
		_context: WebviewViewResolveContext<unknown>,
		_token: CancellationToken
	): void | Thenable<void> {
		webviewView.webview.options = {
			enableScripts: true,
			enableForms: true,
			localResourceRoots: [Uri.joinPath(this.extensionUri, 'dist')]
		};
		webviewView.webview.html = this.getWebviewContent(
			webviewView.webview,
			this.extensionUri
		);
		this.setWebviewMessageListener(webviewView);
	}

	private getWebviewContent(webview: Webview, extensionUri: Uri) {
		const scriptUri = uri(webview, extensionUri, [
			'dist',
			'webviews',
			'main.js'
		]);
		const stylesUri = uri(webview, extensionUri, [
			'dist',
			'webviews',
			'main.css'
		]);
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
		webviewView.webview.onDidReceiveMessage(
			async (message: WebviewMessage) => {
				switch (message.action) {
					case 'PAYMENT_POINTER_LIST':
						const paymentPointers =
							this.state.paymentPointer.list();
						this.postMessage(webviewView.webview, {
							action: 'PAYMENT_POINTER_LIST',
							payload: paymentPointers
						});
						break;
					case 'PAYMENT_POINTER_ADD':
						const client = await createUnauthenticatedClient({});
						const paymentPointer = await client.paymentPointer
							.get({
								url: message.payload.paymentPointer
							})
							.catch(() => {
								throw new Error(
									'Could not fetch payment pointer information'
								);
							});
						const pps =
							this.state.paymentPointer.set(paymentPointer);
						this.secretStorage.store(
							paymentPointer.id,
							JSON.stringify({
								paymentPointer: paymentPointer.id,
								keyId: message.payload.keyId,
								privateKey: message.payload.privateKey
							})
						);
						this.postMessage(webviewView.webview, {
							action: 'PAYMENT_POINTER_LIST',
							payload: pps
						});
						window.showInformationMessage(
							`Payment pointer "${paymentPointer.id}" was added.`
						);
						break;
				}
			}
		);
	}
}
