import { WalletAddress } from "#shared/types";
import { proxy } from "valtio";

interface State {
    walletAddresses: WalletAddress[] | null;
}

const initialState = {
    walletAddresses: null,
} satisfies State;

export const state = proxy<State>(initialState);

export function setWalletAddresses(data: WalletAddress[]) {
    state.walletAddresses = data;
}
