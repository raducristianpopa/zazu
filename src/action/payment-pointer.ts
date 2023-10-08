import { PaymentPointer, PaymentPointerInfo } from '#state/payment-pointer';
import { SecretStorage } from 'vscode';

export class PaymentPointerActions {
	constructor(private storage: SecretStorage) {}

	add(paymentPointer: PaymentPointer, keyId: string) {
		this.storage.store(paymentPointer, JSON.stringify(keyId));
	}

	get(paymentPointer: string) {
		return this.storage.get(paymentPointer);
	}
}
