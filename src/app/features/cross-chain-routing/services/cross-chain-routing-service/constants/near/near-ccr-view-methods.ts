export interface NEAR_CCR_VIEW_METHODS {
  min_token_amount: () => Promise<string>;
  max_token_amount: () => Promise<string>;
  fee_amount_of_blockchain: () => Promise<string>;
  crypto_fee: (toBlockchainInContract: number) => Promise<number>;
  is_paused: () => Promise<boolean>;
}
