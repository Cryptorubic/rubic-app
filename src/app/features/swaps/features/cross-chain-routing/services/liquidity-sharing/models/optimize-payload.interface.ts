export interface PairInfo {
  reserveX: number | string;
  reserveY: number | string;
}

export interface OptimizePayload {
  fromBlockchain: string;
  fromToken: string;
  fromAmount: string;
  toBlockchain: string;
  toToken: string;
  frontBestTrade: {
    input: string;
    output: string;
    loss: string;
  };
  bridges: {
    cBridge: PairInfo;
    deBridge: PairInfo;
    symbiosis: PairInfo;
  };
}
