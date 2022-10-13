export interface PairInfo {
  reserveX: number | string;
  reserveY: number | string;
}

export interface OptimizePayload {
  inputAmount: number | string;
  bridges: {
    celer: PairInfo;
    deBridge: PairInfo;
    symbiosis?: PairInfo;
  };
}
