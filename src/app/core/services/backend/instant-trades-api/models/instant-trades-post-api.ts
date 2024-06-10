export interface OnChainTradeCreationToBackend {
  user: string;
  network: string;
  provider: string;
  slippage: number;
  to_amount_min: string;
  expected_amount: string;
  mevbot_protection: boolean;
  hash?: string;
  from_token?: string;
  to_token?: string;
  from_amount?: string;
  to_amount?: string;
  influencer?: string;
}
