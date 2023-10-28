import { WalletAddressStatus } from "#shared/types";
import { useWalletAddresses } from "#webview/lib/hooks/use-wallet-addresses";
import { useZodForm } from "#webview/lib/hooks/use-zod-form";
import { addWalletAddress, continueGrant, requestGrant, send } from "#webview/lib/messages";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "#webview/ui/accordion";
import { Badge } from "#webview/ui/badge";
import { Button } from "#webview/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "#webview/ui/form";
import * as Icons from "#webview/ui/icons";
import { Input } from "#webview/ui/input";
import { ScrollArea } from "#webview/ui/scroll-area";
import { Separator } from "#webview/ui/separator";
import { Textarea } from "#webview/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "#webview/ui/tooltip";
import { z } from "zod";

export const WalletAddresses = () => {
    const walletAddresses = useWalletAddresses();

    if (walletAddresses === null) {
        return <>Loading...</>;
    }

    return (
        <>
            <ScrollArea className="h-[310px]">
                <Accordion type="single" collapsible className="w-full">
                    {walletAddresses.length === 0 ? (
                        <p className="mt-5 text-center font-medium antialiased">No wallet addresses found.</p>
                    ) : (
                        walletAddresses.map(walletAddress => (
                            <AccordionItem key={walletAddress.id} value={walletAddress.id}>
                                <AccordionTrigger>
                                    <div className="flex items-center space-x-2">
                                        <WalletAddressBadge status={walletAddress.status} />
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
                                    <WalletAddressCTA
                                        walletAddressUrl={walletAddress.id}
                                        status={walletAddress.status}
                                    />
                                </AccordionContent>
                            </AccordionItem>
                        ))
                    )}
                </Accordion>
            </ScrollArea>
            <Separator className="my-5" />
            <AddWalletAddressForm />
        </>
    );
};

const continueSchema = z.object({
    interactRef: z.string().uuid(),
});

const WalletAddressCTA = ({ walletAddressUrl, status }: { walletAddressUrl: string; status: WalletAddressStatus }) => {
    const form = useZodForm({
        schema: continueSchema,
    });

    return (
        <div className="mt-4 space-y-4">
            {status === "WAITING_FOR_APPROVAL" ? (
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(data => {
                            continueGrant(walletAddressUrl, data.interactRef);
                            form.reset();
                        })}
                    >
                        <div className="flex items-center justify-between space-x-4">
                            <FormField
                                control={form.control}
                                name="interactRef"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormControl>
                                            <Input {...field} placeholder="Interaction reference" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button>Continue</Button>
                        </div>
                    </form>
                    <Separator className="mt-4" />
                </Form>
            ) : null}
            <div className="flex items-center">
                {status === "NEEDS_GRANT" || status === "WAITING_FOR_APPROVAL" ? (
                    <Button onClick={() => requestGrant(walletAddressUrl)}>Request grant</Button>
                ) : null}
                <Button className="ml-auto" onClick={() => send()}>
                    Send
                </Button>
                <Button className="ml-auto">Remove</Button>
            </div>
        </div>
    );
};

const WalletAddressBadge = ({ status }: { status: WalletAddressStatus }) => {
    let color = "text-green-500";
    let text = "Active";
    if (status === "NEEDS_GRANT") {
        color = "text-yellow-500";
        text = "Needs grant";
    } else if (status === "WAITING_FOR_APPROVAL") {
        color = "text-violet-500";
        text = "Waiting for approval";
    }

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger tabIndex={-1}>
                    <Badge variant="ghost">
                        <Icons.CheckShield className={`h-4 w-4 ${color}`} />
                    </Badge>
                </TooltipTrigger>
                <TooltipContent>{text}</TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};

const addWalletAddressSchema = z.object({
    walletAddressUrl: z.string().min(2, {
        message: "Username must be at least 2 characters.",
    }),
    keyId: z.string().min(1),
    privateKey: z.string(),
});

const AddWalletAddressForm = () => {
    const form = useZodForm({
        schema: addWalletAddressSchema,
    });

    return (
        <Form {...form}>
            <h1 className="mb-5 text-center text-sm font-medium uppercase antialiased">Add wallet address</h1>
            <form
                onSubmit={form.handleSubmit(data => {
                    addWalletAddress(data);
                    form.reset();
                })}
                className="w-full space-y-6"
            >
                <FormField
                    control={form.control}
                    name="walletAddressUrl"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Wallet address</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="keyId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Key ID</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="privateKey"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Bio</FormLabel>
                            <FormControl>
                                <Textarea className="resize-none" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" className="w-full">
                    Add
                </Button>
            </form>
        </Form>
    );
};
