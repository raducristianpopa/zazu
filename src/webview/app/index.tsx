import { useEventListener } from '#webview/lib/hooks/use-event-listener';
import {
	Outlet,
	RouteObject,
	RouterProvider,
	createMemoryRouter
} from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#webview/ui/tabs';
import { PaymentPointers } from './payment-pointers';
import { messageHandler } from '#webview/lib/messages';

const Wrapper = () => {
	useEventListener('message', messageHandler);

	return <Outlet />;
};

const Index = () => {
	return (
		<Tabs defaultValue="payment-pointers">
			<TabsList className="grid w-full grid-cols-2">
				<TabsTrigger value="payment-pointers">
					Payment pointers
				</TabsTrigger>
				<TabsTrigger value="payments">Payments</TabsTrigger>
			</TabsList>
			<TabsContent value="payment-pointers">
				<PaymentPointers />
			</TabsContent>
			<TabsContent value="payments">Coming soon...</TabsContent>
		</Tabs>
	);
};

export const routes = [
	{
		element: <Wrapper />,
		children: [
			{
				index: true,
				element: <Index />
			}
		]
	}
] satisfies RouteObject[];

const router = createMemoryRouter(routes);

export const App = () => {
	return <RouterProvider router={router} />;
};
