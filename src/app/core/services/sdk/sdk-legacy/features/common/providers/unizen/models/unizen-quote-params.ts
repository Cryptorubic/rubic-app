export interface UniZenCcrQuoteParams {
    fromTokenAddress: string;
    toTokenAddress: string;
    amount: string;
    destinationChainId: number;
    sender: string;
    slippage: number;
    receiver?: string;
}

export type UniZenOnChainQuoteParams = Omit<UniZenCcrQuoteParams, 'destinationChainId'>;

export type UniZenQuoteParams = UniZenCcrQuoteParams | UniZenOnChainQuoteParams;
