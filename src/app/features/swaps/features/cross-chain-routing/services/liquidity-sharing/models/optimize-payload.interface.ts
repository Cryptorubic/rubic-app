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
  frontCalculations: {
    cBridge: {
      input: string;
      output: string;
      loss: string;
    };
    symbiosis: {
      input: string;
      output: string;
      loss: string;
    };
    deBridge: {
      input: string;
      output: string;
      loss: string;
    };
  };
  bridges: {
    cBridge: PairInfo;
    deBridge: PairInfo;
    symbiosis?: PairInfo;
  };
}
