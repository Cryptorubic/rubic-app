export interface XyQuoteRequest {
  srcChainId: number;
  srcQuoteTokenAddress: string;
  srcQuoteTokenAmount: string;
  dstChainId: number;
  dstQuoteTokenAddress: string;
  slippage: number;
  affiliate?: string;
  commissionRate?: number;
  srcSwapProvider?: string;
  bridgeProviders?: string;
  dstSwapProvider?: string;
}
