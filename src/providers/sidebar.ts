import * as vscode from 'vscode';
import { nonce, uri } from '#utils';
import { StateManager } from '#state/state-manager';
import { ActionManager } from '#action/action-manager';

export class SidebarProvider implements vscode.WebviewViewProvider {
	public static readonly viewType = 'zazu-sidebar-view';

	constructor(
		private readonly extensionUri: vscode.Uri,
		private state: StateManager,
		private actions: ActionManager
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
			'sidebar.js'
		]);
		const stylesUri = uri(webview, extensionUri, [
			'dist',
			'webviews',
			'sidebar.css'
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

	private setWebviewMessageListener(webviewView: vscode.WebviewView) {
		webviewView.webview.onDidReceiveMessage(async (message: any) => {
			const command = message.command;

			switch (command) {
				case 'test': {
					this.actions.paymentPointer.add(
						'https://test.com',
						'keyId'
					);
					const secrets = await this.actions.paymentPointer.get(
						'https://test.com'
					);
					console.log(secrets);
					webviewView.webview.postMessage(secrets);
					break;
				}
				case 'get': {
					const secrets = await this.actions.paymentPointer.get(
						'https://test.com'
					);
					webviewView.webview.postMessage(secrets);
					break;
				}
			}
		});
	}
}
