import { ScrollArea } from "#webview/ui/scroll-area";
import {  WalletAddressList } from "./wallet-address-list";

export function WalletAddresses() {
    return (
        <ScrollArea className="h-[310px]">
            <WalletAddressList />
        </ScrollArea>
    );
}
