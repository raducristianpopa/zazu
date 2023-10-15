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

function Wrapper() {
	useEventListener('message', messageHandler);

	return (
		<>
			<Outlet />
			<div className="fixed top-0 right-0 m-8 p-3 text-xs font-mono text-white h-6 w-6 rounded-full flex items-center justify-center bg-gray-700 sm:bg-pink-500 md:bg-orange-500 lg:bg-green-500 xl:bg-blue-500">
				<div className="block  sm:hidden md:hidden lg:hidden xl:hidden">
					al
				</div>
				<div className="hidden sm:block  md:hidden lg:hidden xl:hidden">
					sm
				</div>
				<div className="hidden sm:hidden md:block lg:hidden xl:hidden">
					md
				</div>
				<div className="hidden sm:hidden md:hidden lg:block  xl:hidden">
					lg
				</div>
				<div className="hidden sm:hidden md:hidden lg:hidden xl:block">
					xl
				</div>
			</div>
		</>
	);
}

function Index() {
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
			<TabsContent value="payments">Payments</TabsContent>
		</Tabs>
	);
}

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

export function App() {
	return <RouterProvider router={router} />;
}
