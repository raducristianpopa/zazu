import { useZodForm } from "#webview/lib/hooks/use-zod-form";
import { continueGrant, requestGrant, send } from "#webview/lib/messages";
import { Button } from "#webview/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "#webview/ui/form";
import { Input } from "#webview/ui/input";
import { Separator } from "#webview/ui/separator";
import { z } from "zod";
import { useWalletAddressContext } from "./wallet-address-context";

const schema = z.object({
    interactRef: z.string().uuid(),
});

export function WalletAddressCTA() {
    const { id, status } = useWalletAddressContext();
    const form = useZodForm({
        schema,
        defaultValues: {
            interactRef: "",
        },
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
}
