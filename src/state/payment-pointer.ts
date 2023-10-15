import { PaymentPointer } from '#types';
import { Memento } from 'vscode';

export class PaymentPointerStateManager {
	private readonly stateKey: string = 'payment-pointers';
	constructor(private memento: Memento) {}

	list(): PaymentPointer[] {
		return this.memento.get<PaymentPointer[]>(this.stateKey) ?? [];
	}

	find(id: string): PaymentPointer | undefined {
		const paymentPointers = this.list();
		return paymentPointers.find((paymentPointer) => {
			paymentPointer.id === id;
		});
	}

	set<TKey extends string, TValue extends PaymentPointer>(
		key: TKey,
		value: TValue
	): void | Thenable<void> {
		this.memento.update(key, value);
	}
}
