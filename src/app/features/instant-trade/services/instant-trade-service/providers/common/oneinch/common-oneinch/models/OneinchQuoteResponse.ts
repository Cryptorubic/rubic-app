export interface OneinchQuoteResponse {
  fromToken: object;
  toToken: object;
  toTokenAmount: string;
  fromTokenAmount: string;
  protocols: [{ fromTokenAddress: string; toTokenAddress: string }[][]];
  estimatedGas: string;
}
