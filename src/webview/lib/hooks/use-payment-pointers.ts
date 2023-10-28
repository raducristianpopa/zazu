import { useSnapshot } from "valtio";
import { state } from "../state";
import { PaymentPointer } from "#shared/types";
import { listPaymentPointers } from "../messages";

export function usePaymentPointers(): Readonly<PaymentPointer[]> | null {
    const snapshot = useSnapshot(state).paymentPointers;
    if (snapshot === null) {
        listPaymentPointers();
    }

    return snapshot;
}
