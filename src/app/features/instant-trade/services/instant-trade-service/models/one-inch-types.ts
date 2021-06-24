interface OneInchQuoteResponse {
  fromToken: object;
  toToken: object;
  toTokenAmount: string;
  fromTokenAmount: string;
  protocols: unknown[];
  estimatedGas: string;
}

interface OneInchTokensResponse {
  tokens: {
    [key in string]: unknown;
  };
}

interface OneInchApproveResponse {
  address: string;
}

interface OneInchSwapResponse {
  tx: {
    from: string;
    to: string;
    data: string;
    value: string;
    gasPrice: string;
    gas: number;
  };
  error?: number;
}

export { OneInchQuoteResponse, OneInchSwapResponse, OneInchApproveResponse, OneInchTokensResponse };
