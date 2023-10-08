import * as vscode from 'vscode';
import { nonce, uri } from '#utils';

export class SidebarProvider implements vscode.WebviewViewProvider {
	public static readonly viewType = 'zazu-sidebar-view';

	constructor(private readonly extensionUri: vscode.Uri) {}

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
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${n}';">
    <link href="${stylesUri}" rel="stylesheet">
</head>
<body>
    <script nonce="${n}" src="${scriptUri}"></script>
</body>
</html>`;
	}
}
