export interface RouterQuoteSendParams {
    amount: string;
    fromTokenAddress: string;
    fromTokenChainId: string;
    toTokenAddress: string;
    toTokenChainId: string;
    slippageTolerance?: number;
}
