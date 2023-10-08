import { SidebarProvider } from '#providers/sidebar';
import * as vscode from 'vscode';

export async function activate(context: vscode.ExtensionContext) {
	console.log('your extension "zazu" is now active!');

	const sidebar = new SidebarProvider(context.extensionUri);

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(
			SidebarProvider.viewType,
			sidebar
		)
	);

	let disposable = vscode.commands.registerCommand('zazu.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World from zazu!');
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}
