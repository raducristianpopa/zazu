import { useEventListener } from "#webview/lib/hooks/use-event-listener";
import { Outlet, RouteObject, RouterProvider, createMemoryRouter } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "#webview/ui/tabs";
import { WalletAddresses } from "./wallet-addresses";
import { messageHandler } from "#webview/lib/messages";

const Wrapper = () => {
    useEventListener("message", messageHandler);

    return <Outlet />;
};

const Index = () => {
    return (
        <Tabs defaultValue="wallet-addresses">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="wallet-addresses">Wallet addresses</TabsTrigger>
                <TabsTrigger value="payments">Payments</TabsTrigger>
            </TabsList>
            <TabsContent value="wallet-addresses">
                <WalletAddresses />
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
                element: <Index />,
            },
        ],
    },
] satisfies RouteObject[];

const router = createMemoryRouter(routes);

export const App = () => {
    return <RouterProvider router={router} />;
};
