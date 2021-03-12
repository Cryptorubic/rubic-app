import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import BigNumber from 'bignumber.js';
import { Token } from '../../../shared/models/tokens/Token';

export interface OrderBookToken extends Token {
  amount: string;
  minContribution: string;
  brokerPercent: string;
}

export interface OrderBookDataToken extends Token {
  imageLink: string;

  amountTotal: BigNumber;
  amountContributed: BigNumber;
  amountLeft: BigNumber;
  minContribution: string;
  brokerPercent: number;
}

export type TokenPart = 'base' | 'quote';

export type OrderBookTokens = {
  [tokenPart in TokenPart]: OrderBookToken;
};

export type OrderBookDataTokens = {
  [tokenPart in TokenPart]: OrderBookDataToken;
};

export interface TradeInfo {
  tokens: OrderBookTokens;
  blockchain: BLOCKCHAIN_NAME;
  stopDate: string;
  isPublic: boolean;
  isWithBrokerFee: boolean;
  brokerAddress?: string;
}

export interface TradeData {
  token: OrderBookDataTokens;
  blockchain: BLOCKCHAIN_NAME;
  state: string;
  expirationDay: string;
  expirationTime: string;
  isPublic: boolean;
}

export interface TradeInfoApi {
  memo_contract: string; // unique id, returned from smart-contract after creation
  contract_address: string; // address of smart-contract
  base_address: string; // address of base token
  quote_address: string; // address of quote token
  base_limit: string; // total amount of base tokens
  quote_limit: string; // total amount of base tokens
  base_amount_contributed: string;
  quote_amount_contributed: string;
  stop_date: string; // the date of expiration
  public: boolean; // is trade public or not
  min_base_wei: string; // min amount of base tokens to contribute
  min_quote_wei: string; // min amount of quote tokens to contribute
  broker_fee: boolean; // is with broker's fee or not
  broker_fee_address: string; // broker's adress
  broker_fee_base: number; // broker's percent on base token
  broker_fee_quote: number; // broker's percent on quote token

  // to delete or change
  name: string; // base.token_short_title + ' <> ' + quote.token_short_title
  network: number; // blockchain: 1 - ETH, 22 - BSC, 24 - MAT
  state: string;
  contract_state: 'ACTIVE';
  contract_type: 20;
  notification: false;
  permanent: false;
  is_rubic_order: true;
  rubic_initialized: true;
}
