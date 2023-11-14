import { Uri, Webview } from "vscode";

export function uri(webview: Webview, extensionUri: Uri, pathList: string[]): Uri {
    return webview.asWebviewUri(Uri.joinPath(extensionUri, ...pathList));
}

