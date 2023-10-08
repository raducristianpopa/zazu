import { SecretStorage } from 'vscode';
import { PaymentPointerActions } from './payment-pointer';

export class ActionManager {
	public paymentPointer: PaymentPointerActions;
	constructor(storage: SecretStorage) {
		this.paymentPointer = new PaymentPointerActions(storage);
	}
}
