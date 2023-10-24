import { Memento } from "vscode";
import { PaymentPointerStateManager } from "./payment-pointer";
import { PaymentPointer } from "#types";

interface State {
    paymentPointers: PaymentPointer[];
}

export class StateManager {
    public paymentPointer: PaymentPointerStateManager;
    constructor(private memento: Memento) {
        this.paymentPointer = new PaymentPointerStateManager(memento);
    }

    protected get<TKey extends keyof State, TValue extends State[TKey]>(key: TKey): TValue | undefined {
        return this.memento.get<TValue>(key);
    }

    protected set<TKey extends keyof State>(key: TKey, value: State[TKey]): void | Thenable<void> {
        this.memento.update(key, value);
    }

    protected delete<TKey extends keyof State>(key: TKey): void | Thenable<void> {
        this.memento.update(key, undefined);
    }
}
