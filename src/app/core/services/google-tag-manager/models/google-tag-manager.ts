export interface FormSteps {
  token1: boolean;
  token2: boolean;
  approve: boolean;
}

export enum GA_ERRORS_CATEGORY {
  APPROVE_CROSS_CHAIN_SWAP = 'approve-cross-chain-swap-error',
  CROSS_CHAIN_SWAP = 'cross-chain-swap-error',
  CHANGENOW_CROSS_CHAIN_SWAP = 'changenow-cross-chain-swap-error',
  APPROVE_ON_CHAIN_SWAP = 'approve-on-chain-swap-error',
  ON_CHAIN_SWAP = 'on-chain-swap-error'
}

export interface GasFormAnalytic {
  /* on gas form opening */
  visitedFrom?: 'fromUrl' | 'fromSwapForm';
  /* on leaving gas-form after selecting target token*/
  leaveGasFormInfo?: {
    walletAddress: string;
    toToken: string;
    toBlockchain: string;
  };
  /* true - at least 1 trade is built, false - no routes available */
  isSuccessfullCalculation?: boolean;
  /* successfull swap */
  isSuccessfullSwap?: boolean;
}
