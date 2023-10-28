import { PaymentPointer } from "#shared/types";
import { proxy } from "valtio";

interface State {
    paymentPointers: PaymentPointer[] | null;
}

const initialState = {
    paymentPointers: null,
} satisfies State;

export const state = proxy<State>(initialState);

export function setPaymentPointers(data: PaymentPointer[]) {
    state.paymentPointers = data;
}
