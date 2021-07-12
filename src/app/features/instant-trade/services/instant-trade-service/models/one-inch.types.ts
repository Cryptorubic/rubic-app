export interface OneInchQuoteResponse {
  fromToken: object;
  toToken: object;
  toTokenAmount: string;
  fromTokenAmount: string;
  protocols: unknown[];
  estimatedGas: string;
}

export interface OneInchTokensResponse {
  tokens: {
    [key in string]: unknown;
  };
}

export interface OneInchApproveResponse {
  address: string;
}

export interface OneInchSwapResponse {
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

export interface OneInchTradeRequestParams {
  fromTokenAddress: string;
  toTokenAddress: string;
  amount: string;
  slippage: string;
  fromAddress: string;
  mainRouteParts?: string;
}
