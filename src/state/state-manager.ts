import * as vscode from 'vscode';
import { PaymentPointerStateManager } from './payment-pointer';

interface State {
	paymentPointers: string[];
}

export class StateManager {
	public paymentPointer: PaymentPointerStateManager;
	constructor(private memento: vscode.Memento) {
		this.paymentPointer = new PaymentPointerStateManager(memento);
	}

	get<TKey extends keyof State, TValue extends State[TKey]>(
		key: TKey
	): TValue | undefined {
		return this.memento.get<TValue>(key);
	}

	set<TKey extends keyof State>(
		key: TKey,
		value: State[TKey]
	): void | Thenable<void> {
		this.memento.update(key, value);
	}

	delete<TKey extends keyof State>(key: TKey): void | Thenable<void> {
		this.memento.update(key, undefined);
	}
}
