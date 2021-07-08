export type SushiAction =
  | 'Daily liquidity'
  | 'Daily volume'
  | 'Daily transactions count'
  | 'Informations by pair'
  | 'Find route';

export interface SushiResponse {
  name: 'SushiAPI';
  start_time: string;
  action: SushiAction;
  end_time: string;
}

export interface SushiRoute {
  hops: number;
  route: string;
  sum_output: number;
  max_impact_output: number;
  percent_sum_price_impact: number;
  percent_max_price_impact: number;
  sum_price_impact_per_hop: string;
  max_price_impact_per_hop: string;
  decimals_input: number;
  decimals_output: number;
  fees_sum_price_impact: string;
  fees_max_price_impact: string;
}

export interface SushiRoutesRequest {
  api_key: string;
  quantity: string;
  token_input: string;
  token_output: string;
  hops?: '1' | '2' | '3';
}

export interface SushiRoutesResponse<T> extends SushiResponse {
  route: T;
  number_of_routes: number;
}
