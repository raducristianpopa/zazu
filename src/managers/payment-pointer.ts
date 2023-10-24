import { PaymentPointer } from '#types';
import { Memento, SecretStorage } from 'vscode';

interface PaymentPointerManagerDeps {
	store: Memento;
	secretStorage: SecretStorage;
}

export class PaymentPointerManager {
	private readonly stateKey: string = 'payment-pointer';
	private store: Memento;
	private secretStorage: SecretStorage;

	constructor(deps: PaymentPointerManagerDeps) {
		this.store = deps.store;
		this.secretStorage = deps.secretStorage;
	}

	list(): PaymentPointer[] {
		return this.store.get<PaymentPointer[]>(this.stateKey) ?? [];
	}
}

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

	set(data: Omit<PaymentPointer, 'status'>): PaymentPointer[] {
		const paymentPointers = this.list();
		paymentPointers.push({ ...data, status: 'NEEDS_GRANT' });
		this.memento.update(this.stateKey, paymentPointers);
		return paymentPointers;
	}
}
