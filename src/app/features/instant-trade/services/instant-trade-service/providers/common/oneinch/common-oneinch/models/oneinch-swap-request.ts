export interface OneinchSwapRequest {
  params: {
    fromTokenAddress: string;
    toTokenAddress: string;
    amount: string;
    slippage: string;
    fromAddress: string;
    disableEstimate?: boolean;
    mainRouteParts?: string;
  };
}
