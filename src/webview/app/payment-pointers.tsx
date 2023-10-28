import { PaymentPointerStatus } from "#types";
import { usePaymentPointers } from "#webview/lib/hooks/use-payment-pointers";
import { useZodForm } from "#webview/lib/hooks/use-zod-form";
import { addPaymentPointer, continueGrant, requestGrant, send } from "#webview/lib/messages";
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

export const PaymentPointers = () => {
    const paymentPointers = usePaymentPointers();

    if (paymentPointers === null) {
        return <>Loading...</>;
    }

    return (
        <>
            <ScrollArea className="h-[310px]">
                <Accordion type="single" collapsible className="w-full">
                    {paymentPointers.length === 0 ? (
                        <p className="mt-5 text-center font-medium antialiased">No payment pointers found.</p>
                    ) : (
                        paymentPointers.map(paymentPointer => (
                            <AccordionItem key={paymentPointer.id} value={paymentPointer.id}>
                                <AccordionTrigger>
                                    <div className="flex items-center space-x-2">
                                        <PaymentPointerBadge status={paymentPointer.status} />
                                        <span className="text-sm">{paymentPointer.id}</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-4">
                                    <div className="flex items-center space-x-1">
                                        <p className="font-semibold">URL:</p>
                                        <p>{paymentPointer.id}</p>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <p className="font-semibold">Auth server:</p>
                                        <p>{paymentPointer.authServer}</p>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <p className="font-semibold">Asset code:</p>
                                        <p>{paymentPointer.assetCode}</p>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <p className="font-semibold">Asset scale:</p>
                                        <p>{paymentPointer.assetScale}</p>
                                    </div>
                                    <PaymentPointerCTA id={paymentPointer.id} status={paymentPointer.status} />
                                    {/* <div className="mt-4 flex items-center justify-between">
                                        {paymentPointer.status === "NEEDS_GRANT" ? (
                                            <Button onClick={() => requestGrant(paymentPointer.id)}>
                                                Request grant
                                            </Button>
                                        ) : null}
                                        <Button>Remove</Button>
                                    </div> */}
                                </AccordionContent>
                            </AccordionItem>
                        ))
                    )}
                </Accordion>
            </ScrollArea>
            <Separator className="my-5" />
            <AddPaymentPointerForm />
        </>
    );
};

const continueSchema = z.object({
    interactRef: z.string().uuid(),
});

const PaymentPointerCTA = ({ id, status }: { id: string; status: PaymentPointerStatus }) => {
    const form = useZodForm({
        schema: continueSchema,
    });

    return (
        <div className="mt-4 space-y-4">
            {status === "WAITING_FOR_APPROVAL" ? (
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(data => {
                            continueGrant(id, data.interactRef);
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
                    <Button onClick={() => requestGrant(id)}>Request grant</Button>
                ) : null}
                <Button className="ml-auto" onClick={() => send()}>
                    Send
                </Button>
                <Button className="ml-auto">Remove</Button>
            </div>
        </div>
    );
};

const PaymentPointerBadge = ({ status }: { status: PaymentPointerStatus }) => {
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

const addPaymentPointerSchema = z.object({
    paymentPointer: z.string().min(2, {
        message: "Username must be at least 2 characters.",
    }),
    keyId: z.string().min(1),
    privateKey: z.string(),
});

const AddPaymentPointerForm = () => {
    const form = useZodForm({
        schema: addPaymentPointerSchema,
    });

    return (
        <Form {...form}>
            <h1 className="mb-5 text-center text-sm font-medium uppercase antialiased">Add payment pointer</h1>
            <form
                onSubmit={form.handleSubmit(data => {
                    addPaymentPointer(data);
                    form.reset();
                })}
                className="w-full space-y-6"
            >
                <FormField
                    control={form.control}
                    name="paymentPointer"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Payment pointer</FormLabel>
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
