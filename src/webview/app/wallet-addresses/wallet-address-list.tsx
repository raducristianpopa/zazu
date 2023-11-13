import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "#webview/ui/accordion";
import { WalletAddressCTA } from "./wallet-address-cta";
import { useWalletAddresses } from "#webview/lib/hooks/use-wallet-addresses";
import { WalletAddress, WalletAddressStatus } from "#shared/types";
import { WalletAddressProvider, useWalletAddressContext } from "./wallet-address-context";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "#webview/ui/tooltip";
import { Badge } from "#webview/ui/badge";
import * as Icons from "#webview/ui/icons";

export function WalletAddressList() {
    const walletAddresses = useWalletAddresses();

    if (walletAddresses === null) {
        return <>Loading...</>;
    }

    if (walletAddresses.length === 0) {
        return <p className="mt-5 text-center font-medium antialiased">No wallet addresses found.</p>;
    }

    return (
        <Accordion type="single" collapsible className="w-full">
            {walletAddresses.map(walletAddress => (
                <WalletAddressItem key={walletAddress.id} walletAddress={walletAddress} />
            ))}
        </Accordion>
    );
}

function WalletAddressItem({ walletAddress }: { walletAddress: WalletAddress }) {
    return (
        <WalletAddressProvider value={walletAddress}>
            <WalletAddressInformation />
        </WalletAddressProvider>
    );
}

function WalletAddressInformation() {
    const walletAddress = useWalletAddressContext();

    return (
        <AccordionItem value={walletAddress.id}>
            <AccordionTrigger>
                <div className="flex items-center space-x-2">
                    <WalletAddressBadge />
                    <span className="text-sm">{walletAddress.id}</span>
                </div>
            </AccordionTrigger>
            <AccordionContent className="px-4">
                <div className="flex items-center space-x-1">
                    <p className="font-semibold">URL:</p>
                    <p>{walletAddress.id}</p>
                </div>
                <div className="flex items-center space-x-1">
                    <p className="font-semibold">Auth server:</p>
                    <p>{walletAddress.authServer}</p>
                </div>
                <div className="flex items-center space-x-1">
                    <p className="font-semibold">Asset code:</p>
                    <p>{walletAddress.assetCode}</p>
                </div>
                <div className="flex items-center space-x-1">
                    <p className="font-semibold">Asset scale:</p>
                    <p>{walletAddress.assetScale}</p>
                </div>
                <WalletAddressCTA />
            </AccordionContent>
        </AccordionItem>
    );
}

const badgeStyles: Record<WalletAddressStatus, { color: string; text: string }> = {
    ACTIVE: {
        color: "text-green-500",
        text: "Active",
    },
    NEEDS_GRANT: {
        color: "text-yellow-500",
        text: "Needs grant",
    },
    WAITING_FOR_APPROVAL: {
        color: "text-violet-500",
        text: "Waiting for approval",
    },
};

export function WalletAddressBadge() {
    const { status } = useWalletAddressContext();
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger tabIndex={-1}>
                    <Badge variant="ghost">
                        <Icons.CheckShield className={`h-4 w-4 ${badgeStyles[status].color}`} />
                    </Badge>
                </TooltipTrigger>
                <TooltipContent>{badgeStyles[status].text}</TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
