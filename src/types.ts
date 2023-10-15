export interface PaymentPointer {
	id: string;
	authServer: string;
	assetCode: string;
	assetScale: number;
	publicName?: string;
}

export const WebviewAction = {
	PAYMENT_POINTER_LIST: 'PAYMENT_POINTER_LIST'
} as const;
export type WebviewAction = (typeof WebviewAction)[keyof typeof WebviewAction];

export interface WebviewActionPayload {
	[WebviewAction.PAYMENT_POINTER_LIST]: undefined;
}

export type WebviewMessageHKT<
	TAction extends WebviewAction,
	TPayload = undefined
> = TPayload extends undefined
	? { action: TAction }
	: { action: TAction; payload: TPayload };

export type WebviewMessage = {
	[K in WebviewAction]: WebviewMessageHKT<K, WebviewActionPayload[K]>;
}[WebviewAction];

export const ExtensionAction = {
	PAYMENT_POINTER_LIST: 'PAYMENT_POINTER_LIST'
} as const;
export type ExtensionAction =
	(typeof ExtensionAction)[keyof typeof ExtensionAction];

export interface ExtensionActionPayload {
	[ExtensionAction.PAYMENT_POINTER_LIST]: PaymentPointer[];
}

export type ExtensionMessageHKT<
	TAction extends ExtensionAction,
	TPayload = undefined
> = TPayload extends undefined
	? { action: TAction }
	: { action: TAction; payload: TPayload };

export type ExtensionMessage = {
	[K in ExtensionAction]: ExtensionMessageHKT<K, ExtensionActionPayload[K]>;
}[ExtensionAction];
