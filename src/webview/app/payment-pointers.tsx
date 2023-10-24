import { PaymentPointerStatus } from "#types";
import { usePaymentPointers } from "#webview/lib/hooks/use-payment-pointers";
import { useZodForm } from "#webview/lib/hooks/use-zod-form";
import { addPaymentPointer } from "#webview/lib/messages";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "#webview/ui/accordion";
import { Badge } from "#webview/ui/badge";
import { Button } from "#webview/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "#webview/ui/form";
import * as Icons from "#webview/ui/icons";
import { Input } from "#webview/ui/input";
import { ScrollArea } from "#webview/ui/scroll-area";
import { Separator } from "#webview/ui/separator";
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
                                    <div className="mt-4 flex items-center justify-between">
                                        {paymentPointer.status === "NEEDS_GRANT" ? (
                                            <Button>Request grant</Button>
                                        ) : null}
                                        <Button>Remove</Button>
                                    </div>
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

const formSchema = z.object({
    paymentPointer: z.string().min(2, {
        message: "Username must be at least 2 characters.",
    }),
    keyId: z.string().min(1),
    privateKey: z.string(),
});

const PaymentPointerBadge = ({ status }: { status: PaymentPointerStatus }) => {
    let color = "text-green-500";
    let text = "Active";
    console.log(status);
    if (status === "NEEDS_GRANT") {
        color = "text-yellow-500";
        text = "Needs grant";
    }

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger>
                    <Badge variant="ghost">
                        <Icons.CheckShield className={`h-4 w-4 ${color}`} />
                    </Badge>
                </TooltipTrigger>
                <TooltipContent>{text}</TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};

const AddPaymentPointerForm = () => {
    const form = useZodForm({
        schema: formSchema,
    });

    return (
        <Form {...form}>
            <h1 className="etext-center mb-5 text-sm font-medium uppercase antialiased">Add payment pointer</h1>
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
                            <FormLabel>Private key</FormLabel>
                            <FormControl>
                                <Input {...field} />
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
