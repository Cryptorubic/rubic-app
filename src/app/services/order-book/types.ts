import { BLOCKCHAIN_NAME } from '../blockchain/types/Blockchain';

export interface OrderBookToken {
  address: string;
  name: string;
  symbol: string;
  decimals: number;

  amount: string;
  minContribution: string;
  brokerPercent: string;
}

export type TokenPart = 'base' | 'quote';

export type OrderBookTokens = {
  [tokenPart in TokenPart]: OrderBookToken;
};

export interface TradeInfo {
  tokens: OrderBookTokens;
  blockchain: BLOCKCHAIN_NAME;
  stopDate: string;
  isPublic: boolean;
  isWithBrokerFee: boolean;
  brokerAddress?: string;
}

export interface TradeInfoApi {
  memo_contract: string; // unique id, returned from smart-contract after creation
  contract_address: string; // address of smart-contract
  base_address: string; // address of base token
  quote_address: string; // address of quote token
  base_limit: string; // base.amount * (10 ** base.decimals)
  quote_limit: string; // quote.amount * (10 ** quote.decimals)
  stop_date: string; // the date of expiration
  public: boolean; // is trade public or not
  min_base_wei: string; // min amount of base token to contribute
  min_quote_wei: string; // min amount of quote token to contribute
  broker_fee: boolean; // is with broker's fee
  broker_fee_address: string; // broker's adress
  broker_fee_base: number; // broker's percent on base token
  broker_fee_quote: number; // broker's percent on quote token

  // to delete or change
  name: string; // base.token_short_title + ' <> ' + quote.token_short_title
  network: number; // blockchain: 1 - ETH, 22 - BSC, 24 - MAT
  state: 'ACTIVE';
  contract_state: 'ACTIVE';
  contract_type: 20;
  notification: false;
  permanent: false;
  is_rubic_order: true;
  rubic_initialized: true;
}
