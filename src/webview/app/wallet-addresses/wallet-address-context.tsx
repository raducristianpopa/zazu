import { WalletAddress } from "#shared/types";
import { ReactNode, createContext, useContext } from "react";

export const WalletAddressContext = createContext<WalletAddress>({} as WalletAddress);

export function WalletAddressProvider({ value, children }: { value: WalletAddress; children: ReactNode }) {
    return <WalletAddressContext.Provider value={value}>{children}</WalletAddressContext.Provider>;
}

export function useWalletAddressContext() {
    const context = useContext(WalletAddressContext);

    if (!context) {
        throw new Error('"useWalletAddress" should be used within a "WalletAddressProvider"');
    }

    return context;
}
