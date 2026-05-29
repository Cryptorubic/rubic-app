export interface JupiterSwapBuildTxResp {
  success: boolean;
  orderResponse: JupiterSwapBuildTxSuccessResp;
}

export type JupiterSwapBuildTxSuccessResp = {
  error?: string;
  /**
   * destination token amount after swap
   */
  outAmount: string;
  /**
   * base64 data
   */
  transaction: string;
  requestId: string;
};

export interface JupiterSwapSendTxResp {
  success: boolean;
  exeRes: { signature: string };
}

export interface PrivacyCashFeesResp {
  withdraw_fee_rate: number;
  withdraw_rent_fee: number;
  deposit_fee_rate: number;
  rent_fees: {
    [tokenSymbol: string]: number;
  };
  minimum_withdrawal: {
    [tokenSymbol: string]: number;
  };
  prices: {
    [tokenSymbol: string]: number;
  };
  usdc_withdraw_rent_fee: number;
}
