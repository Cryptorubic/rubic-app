export interface LifiToken {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  chainId: number;
  logoURI: string;
  priceUSD: string;
}

export interface LifiTokens {
  tokens: {
    [chainId: number]: LifiToken[];
  };
}
