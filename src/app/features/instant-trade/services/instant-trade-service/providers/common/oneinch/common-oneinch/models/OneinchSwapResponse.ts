export interface OneinchSwapResponse {
  tx: {
    from: string;
    to: string;
    data: string;
    value: string;
    gasPrice: string;
    gas: number;
  };
  toTokenAmount: string;
  error?: number;
}
