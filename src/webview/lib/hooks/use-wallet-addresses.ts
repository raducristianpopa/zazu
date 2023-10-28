import { useSnapshot } from "valtio";
import { state } from "../state";
import { WalletAddress } from "#shared/types";
import { listWalletAddresses } from "../messages";

export function useWalletAddresses(): Readonly<WalletAddress[]> | null {
    const snapshot = useSnapshot(state).walletAddresses;
    if (snapshot === null) {
        listWalletAddresses();
    }

    return snapshot;
}
