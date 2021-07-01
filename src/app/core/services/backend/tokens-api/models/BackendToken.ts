export interface BackendToken {
  address: string;
  name: string;
  symbol: string;
  blockchain_network: string;
  decimals: number;
  rank: number;
  image: string;
  coingecko_id: string;
  usd_price: number;
  used_in_iframe: boolean;
}
