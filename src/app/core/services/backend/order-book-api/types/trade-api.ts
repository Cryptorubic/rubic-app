export interface OrderBookTradeApi {
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
  unique_link: string; // Unique link to display trade.

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
