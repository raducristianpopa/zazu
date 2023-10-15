import { ExtensionAction, ExtensionMessage } from '#types';
import { setPaymentPointers } from './state';
import { vscode } from './vscode';

export function listPaymentPointers(): void {
	vscode.postMessage({
		action: 'PAYMENT_POINTER_LIST'
	});
}

export function messageHandler(event: MessageEvent<ExtensionMessage>) {
	const { action, payload } = event.data;

	switch (action) {
		case ExtensionAction.PAYMENT_POINTER_LIST:
			setPaymentPointers(payload);
	}
}
