import { ActionManager } from '#action/action-manager';
import { PaymentPointerActions } from '#action/payment-pointer';
import { SidebarProvider } from '#providers/sidebar';
import { StateManager } from '#state/state-manager';
import * as vscode from 'vscode';

export async function activate(context: vscode.ExtensionContext) {
	console.log('your extension "zazu" is now active!');

	const state = new StateManager(context.globalState);
	const action = new ActionManager(context.secrets);
	const sidebar = new SidebarProvider(context.extensionUri, state, action);

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
