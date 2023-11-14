import { ScrollArea } from "#webview/ui/scroll-area";
import { useEffect } from "react";
import { WalletAddressList } from "./wallet-address-list";
import { Messages } from "#webview/lib/messages";

export function WalletAddresses() {
    useEffect(() => {
        async function fetch() {
            const result = await Messages.post({ action: "SEND" });
            console.log(result);
        }
        fetch();
    }, []);

    return (
        <ScrollArea className="h-[310px]">
            <WalletAddressList />
        </ScrollArea>
    );
}
