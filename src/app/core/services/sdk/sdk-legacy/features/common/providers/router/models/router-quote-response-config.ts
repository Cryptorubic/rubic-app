type RouterFlowType = 'trustless' | 'mint-burn' | 'circle' | 'gateway' | 'none';

interface RouterAsset {
  decimals: number;
  symbol: string;
  name: string;
  chainId: string;
  address: string;
  resourceID: string;
  isMintable: boolean;
  isWrappedAsset: boolean;
}

interface RouterSwapTokenInfo {
  chainId: string;
  asset: RouterAsset;
  stableReserveAsset: RouterAsset;
  tokenAmount: string;
  stableReserveAmount: string;
  path: string[];
  flags: string[];
  priceImpact: string;
  tokenPath: string;
  dataTx: string[];
}

export interface RouterQuoteResponseConfig {
  flowType: RouterFlowType;
  isTransfer: boolean;
  isWrappedToken: boolean;
  allowanceTo: string;
  fromTokenAddress: string;
  toTokenAddress: string;
  source: RouterSwapTokenInfo & {
    bridgeFeeAmount: string;
  };
  destination: RouterSwapTokenInfo;
  partnerId: number;
  estimatedTime: number;
  slippageTolerance: number;
  bridgeFee?: {
    // wei
    amount: string;
    decimals: number;
    symbol: string;
    address: string;
  };
}
