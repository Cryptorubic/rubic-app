export interface EstimateAmtResponse {
  eq_value_token_amt: string;
  estimated_receive_amt: string;
  bridge_rate: number;
  perc_fee: string;
  base_fee: string;
  slippage_tolerance: number;
  max_slippage: number;
}
