export interface BridgersQuoteRequest {
    fromTokenAddress: string;
    toTokenAddress: string;
    fromTokenAmount: string;
    fromTokenChain: string;
    toTokenChain: string;
}

export interface BridgersQuoteResponse {
    resMsg: string;
    resCode: number;
    data: {
        txData: {
            toTokenAmount: number;
            amountOutMin: string;
            fee: number;
            chainFee: string;
            depositMin: string;
            depositMax: string;
            contractAddress: string;
        };
    };
}
