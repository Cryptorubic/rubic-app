export interface UniZenOnChainSwapParams {
    transactionData: Object;
    nativeValue: string;
    account: string;
    receiver: string;
    tradeType: number;
}

export type UniZenCcrSwapParams = Omit<UniZenOnChainSwapParams, 'tradeType'>;

export type UniZenSwapParams = UniZenOnChainSwapParams | UniZenCcrSwapParams;
