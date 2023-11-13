import { useState } from "react";
import { Button } from "#webview/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "#webview/ui/dialog";
import { Input } from "#webview/ui/input";
import * as Icons from "#webview/ui/icons";
import { z } from "zod";
import { useZodForm } from "#webview/lib/hooks/use-zod-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "#webview/ui/form";
import { addWalletAddress } from "#webview/lib/messages";
import { Textarea } from "#webview/ui/textarea";

const schema = z.object({
    walletAddressUrl: z.string().min(1),
    keyId: z.string().min(1),
    privateKey: z.string().min(1),
});
const formId = "add-wallet-address-form";

export function WalletAddressDialog() {
    const [open, setOpen] = useState(false);
    const form = useZodForm({
        schema,
        defaultValues: {
            walletAddressUrl: "",
            keyId: "",
            privateKey: "",
        },
    });

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="fixed bottom-0 right-0 mb-5 mr-5 space-x-1" type="button">
                    <Icons.Plus />
                    <span>Add wallet address</span>
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add wallet address</DialogTitle>
                </DialogHeader>
                <div className="flex items-center space-x-2">
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(data => {
                                addWalletAddress(data);
                                form.reset();
                                setOpen(false);
                            })}
                            className="w-full space-y-6"
                            id={formId}
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
                                        <FormLabel>Private key</FormLabel>
                                        <FormControl>
                                            <Textarea className="resize-none" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </form>
                    </Form>
                </div>
                <DialogFooter className="space-y-4 sm:items-center sm:justify-between sm:space-y-0">
                    <DialogClose asChild>
                        <Button type="button" className="w-full sm:w-auto" variant="secondary">
                            Close
                        </Button>
                    </DialogClose>
                    <Button type="submit" className="w-full sm:w-auto" form={formId}>
                        Add
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
