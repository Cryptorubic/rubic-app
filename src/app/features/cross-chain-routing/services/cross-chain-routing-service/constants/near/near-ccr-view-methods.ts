export interface NearCcrViewMethods {
  get_min_token_amount: () => Promise<string>;
  get_max_token_amount: () => Promise<string>;
  get_fee_amount_of_blockchain: () => Promise<string>;
  crypto_fee: (toBlockchainInContract: number) => Promise<number>;
  is_running: () => Promise<boolean>;
}

export const NEAR_CCR_VIEW_METHODS: ReadonlyArray<keyof NearCcrViewMethods> = [
  'get_min_token_amount',
  'get_max_token_amount',
  'get_fee_amount_of_blockchain',
  'crypto_fee',
  'is_running'
];
