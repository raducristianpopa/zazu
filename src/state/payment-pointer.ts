import { Memento } from 'vscode';

export type PaymentPointer = `https://${string}` | `http://${string}`;

export interface PaymentPointerInfo {
	id: string;
	authServer: string;
	assetCode: string;
	assetScale: number;
	publicName: string | undefined;
}

export class PaymentPointerStateManager {
	constructor(private memento: Memento) {}

	get<TKey extends PaymentPointer>(key: TKey): string | undefined {
		return this.memento.get<string>(key);
	}

	set<TKey extends PaymentPointer, TValue extends PaymentPointerInfo>(
		key: TKey,
		value: TValue
	): void | Thenable<void> {
		this.memento.update(key, value);
	}
}
