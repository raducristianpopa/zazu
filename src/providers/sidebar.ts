import * as vscode from 'vscode';
import { nonce, uri } from '#utils';
import { ExtensionMessage, WebviewMessage } from '#types';
import { StateManager } from '#state/state-manager';

export class SidebarProvider implements vscode.WebviewViewProvider {
	public static readonly viewType = 'zazu-sidebar-view';

	constructor(
		private readonly extensionUri: vscode.Uri,
		private state: StateManager
	) {}

	public resolveWebviewView(
		webviewView: vscode.WebviewView,
		_context: vscode.WebviewViewResolveContext<unknown>,
		_token: vscode.CancellationToken
	): void | Thenable<void> {
		webviewView.webview.options = {
			enableScripts: true,
			enableForms: true,
			localResourceRoots: [vscode.Uri.joinPath(this.extensionUri, 'dist')]
		};
		webviewView.webview.html = this.getWebviewContent(
			webviewView.webview,
			this.extensionUri
		);
		this.setWebviewMessageListener(webviewView);
	}

	private getWebviewContent(
		webview: vscode.Webview,
		extensionUri: vscode.Uri
	) {
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

	private postMessage(webview: vscode.Webview, message: ExtensionMessage) {
		webview.postMessage(message);
	}

	private setWebviewMessageListener(webviewView: vscode.WebviewView) {
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
				}
			}
		);
	}
}
