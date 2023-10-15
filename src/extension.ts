import { SidebarProvider } from '#providers/sidebar';
import { StateManager } from '#state/state-manager';
import { ExtensionContext, window, commands } from 'vscode';

export async function activate(context: ExtensionContext) {
	const state = new StateManager(context.globalState);
	const sidebar = new SidebarProvider(context.extensionUri, state);

	context.subscriptions.push(
		window.registerWebviewViewProvider(SidebarProvider.viewType, sidebar)
	);

	let disposable = commands.registerCommand('zazu.helloWorld', () => {
		// vscode.commands.executeCommand(
		// 	'simpleBrowser.show',
		// 	'https://rafiki.money'
		// );
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}
