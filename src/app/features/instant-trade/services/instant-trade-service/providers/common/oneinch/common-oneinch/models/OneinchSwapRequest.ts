export interface OneinchSwapRequest {
  params: {
    fromTokenAddress: string;
    toTokenAddress: string;
    amount: string;
    slippage: string;
    fromAddress: string;
    mainRouteParts?: string;
  };
}
