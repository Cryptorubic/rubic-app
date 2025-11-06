export interface XyQuoteSuccessResponse {
  success: boolean;
  routes: XyRoute[];
}

interface QuoteToken {
  chainId: number; // 324
  address: string; // '0x...'
  decimals: number; // 18
  symbol: string; // 'ETH'
}

interface QuoteBridgeDescription {
  provider: string; // 'yBridge'
  srcChainId: number; // 324
  srcBridgeTokenAddress: string; // '0x...'
  dstChainId: number; // 59144
  dstBridgeTokenAddress: string; // '0x...'
  srcBridgeTokenAmount: string; // '9990000000000000'
  dstBridgeTokenAmount: string; // '9190000000000000'
  bridgeContractAddress: string; // '0x...'
  bridgeFeeAmount: string; // '800000000000000'
  bridgeFeeToken: QuoteToken;
  srcBridgeToken: QuoteToken;
  dstBridgeToken: QuoteToken;
}

interface QuoteSwapDescription {
  chainId: string; // '59144'
  provider: string; // 'OpenOcean V3 DexAggregator'
  srcTokenAddress: string; // '0x...'
  dstTokenAddress: string; // '0x...'
  srcTokenAmount: string; // '997500000'
  dstTokenAmount: string; // '609954227563476606'
  dexNames: string[]; // ['Horizon']
}

export interface XyQuote {
  srcSwapDescription: QuoteSwapDescription;
  bridgeDescription: QuoteBridgeDescription;
  dstSwapDescription: QuoteSwapDescription;
  dstQuoteTokenAmount: string; // '9190000000000000'
}

export interface XyRoute extends XyQuote {
  srcChainId: number; // 324
  srcQuoteTokenAddress: string; // '0x...'
  srcQuoteTokenAmount: string; // '10000000000000000'
  dstChainId: number; // 59144
  dstQuoteTokenAddress: string; // '0x...'
  slippage: number; // 1
  minReceiveAmount: string; // '9098100000000000'
  affiliateFeeAmount: string; // '10000000000000'
  withholdingFeeAmount: string; // '0'
  routeType: string; // 'xy_router_cross_chain'
  tags: [];
  contractAddress: string; // '0x...'
  withholdingFeeToken: QuoteToken;
  srcQuoteToken: QuoteToken;
  dstQuoteToken: QuoteToken;
  srcQuoteTokenUsdValue: string; // '16.3805'
  dstQuoteTokenUsdValue: string; // '15.0536795'
  transactionCounts: number; // 2
  estimatedGas: string; // '10200000'
  estimatedGasFeeAmount: string; // '102000000000000'
  estimatedTransferTime: number; // 180
}
