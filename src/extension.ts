import { SidebarProvider } from "#providers/sidebar";
import { ExtensionContext, window, commands } from "vscode";
import { PaymentPointerManager } from "#managers/payment-pointer";
import { createUnauthenticatedClient } from "@interledger/open-payments";

export async function activate(context: ExtensionContext) {
    const { globalState, secrets, subscriptions, extensionUri } = context;

    const sdk = await createUnauthenticatedClient({});
    const paymentPointerManager = new PaymentPointerManager(globalState, secrets, sdk);

    const sidebar = new SidebarProvider({
        extensionUri,
        paymentPointerManager,
        secretStorage: secrets,
    });
    const t = await context.secrets.get(`token:https://ilp.rafiki.money/radu`);
    console.log(t);
    // await context.secrets.delete("https://ilp.rafiki.money/radu");

    subscriptions.push(window.registerWebviewViewProvider(SidebarProvider.viewType, sidebar));

    let disposable = commands.registerCommand("zazu.helloWorld", () => {
        // vscode.commands.executeCommand(
        // 	'simpleBrowser.show',
        // 	'https://rafiki.money'
        // );
    });

    subscriptions.push(disposable);
}

export function deactivate() {}
