export interface UniZenOnChainQuoteResponse {
    contractVersion: string;
    deltaAmount: string;
    fee: string;
    fromTokenAmount: string;
    gasPrice: string;
    isULDM: string;
    nativeValue: string;
    priceImpact: number;
    protocol: { name: string }[];
    recommendedSlippage: number;
    slippage: number;
    toTokenAmount: string;
    toTokenAmountWithoutFee: string;
    tokenFrom: object;
    tokenTo: object;
    tradeType: number;
    transactionData: {
        call: UniZenCallInfo[];
        info: UniZenOnChainTxInfo;
    };
}

interface UniZenCallInfo {
    amount: string;
    amountDelta: string;
    buyToken: string;
    data: string;
    sellToken: string;
    targetExchange: string;
    targetExchangeID: string;
}

interface UniZenOnChainTxInfo {
    actualQuote: string;
    amountIn: string;
    amountOutMin: string;
    apiId: string;
    deadline: number;
    dstToken: string;
    feePercent: number;
    path: string[];
    requestId: string;
    sharePercent: number;
    slippage: number;
    srcToken: string;
    tokenHasTaxes: boolean;
    tradeType: number;
    userPSFee: number;
    uuid: string;
    v3Path: string;
}
