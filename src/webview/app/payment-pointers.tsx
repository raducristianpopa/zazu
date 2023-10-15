import { usePaymentPointers } from '#webview/lib/hooks/use-payment-pointers';
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger
} from '#webview/ui/accordion';
import { ScrollArea } from '#webview/ui/scroll-area';

export function PaymentPointers() {
	const paymentPointers = usePaymentPointers();

	if (paymentPointers === null) {
		return <>Loading...</>;
	}

	if (paymentPointers.length === 0) {
		return (
			<div className="flex items-center justify-center">
				<p>No payment pointers.</p>
			</div>
		);
	}

	return (
		<ScrollArea className="h-[310px]">
			<Accordion type="single" collapsible className="w-full">
				{paymentPointers.map((paymentPointer) => (
					<AccordionItem
						key={paymentPointer.id}
						value={paymentPointer.id}
					>
						<AccordionTrigger>{paymentPointer.id}</AccordionTrigger>
						<AccordionContent>content</AccordionContent>
					</AccordionItem>
				))}
			</Accordion>
		</ScrollArea>
	);
}
