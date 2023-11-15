export const WalletAddressStatus = {
    ACTIVE: "ACTIVE",
    NEEDS_GRANT: "NEEDS_GRANT",
    WAITING_FOR_APPROVAL: "WAITING_FOR_APPROVAL",
} as const;
export type WalletAddressStatus = (typeof WalletAddressStatus)[keyof typeof WalletAddressStatus];

export interface WalletAddress {
    id: string;
    authServer: string;
    assetCode: string;
    assetScale: number;
    status: WalletAddressStatus;
    publicName?: string;
    continueUri?: string;
    continueToken?: string;
}

export const WebviewAction = {
    WALLET_ADDRESS_LIST: "WALLET_ADDRESS_LIST",
    WALLET_ADDRESS_ADD: "WALLET_ADDRESS_ADD",
    REQUEST_GRANT: "REQUEST_GRANT",
    CONTINUE_GRANT: "CONTINUE_GRANT",

    SEND: "SEND",
} as const;
export type WebviewAction = (typeof WebviewAction)[keyof typeof WebviewAction];

export interface WalletAddressAddPayload {
    walletAddressUrl: string;
    keyId: string;
    privateKey: string;
}

export interface RequestGrantPayload {
    walletAddressUrl: string;
}

export interface ContinueGrantPayload {
    walletAddressUrl: string;
    interactRef: string;
}

export interface WebviewActionPayload {
    [WebviewAction.WALLET_ADDRESS_LIST]: undefined;
    [WebviewAction.WALLET_ADDRESS_ADD]: WalletAddressAddPayload;
    [WebviewAction.REQUEST_GRANT]: RequestGrantPayload;
    [WebviewAction.CONTINUE_GRANT]: ContinueGrantPayload;
    [WebviewAction.SEND]: undefined;
}

export type WebviewMessageHKT<TAction extends WebviewAction, TPayload = undefined> = (TPayload extends undefined
    ? { action: TAction }
    : { action: TAction; payload: TPayload }) & { id?: string };

export type WebviewMessage = {
    [K in WebviewAction]: WebviewMessageHKT<K, WebviewActionPayload[K]>;
}[WebviewAction];

export const ExtensionAction = {
    WALLET_ADDRESS_LIST: "WALLET_ADDRESS_LIST",

    SEND: "SEND",
} as const;
export type ExtensionAction = (typeof ExtensionAction)[keyof typeof ExtensionAction];

export interface ExtensionActionPayload {
    [ExtensionAction.WALLET_ADDRESS_LIST]: WalletAddress[];
    [ExtensionAction.SEND]: { test: string; a: string; c: boolean; d: () => void };
}

export type ExtensionMessageHKT<TAction extends ExtensionAction, TPayload = undefined> = (TPayload extends undefined
    ? { action: TAction }
    : { action: TAction; payload: TPayload }) & { id?: string; error?: string };

export type ExtensionMessage = {
    [K in ExtensionAction]: ExtensionMessageHKT<K, ExtensionActionPayload[K]>;
}[ExtensionAction];

export interface MessageResponse<TPayload = undefined> {
    success: boolean;
    payload: TPayload;
    error?: string;
}
