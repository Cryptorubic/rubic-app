export interface OrderBookTradeApi {
  memo: string; // unique id, returned from smart-contract after creation
  contract_address: string; // address of smart-contract
  base_address: string; // address of from token
  quote_address: string; // address of to token
  base_limit: string; // total amount of from tokens
  quote_limit: string; // total amount of to tokens
  base_amount_contributed: string;
  quote_amount_contributed: string;
  stop_date: string; // the date of expiration
  public: boolean; // is trade public or not
  min_base_wei: string; // min amount of from tokens to contribute
  min_quote_wei: string; // min amount of to tokens to contribute
  broker_fee: boolean; // is with broker's fee or not
  broker_fee_address: string; // broker's adress
  broker_fee_base: number; // broker's percent on from token
  broker_fee_quote: number; // broker's percent on to token
  unique_link?: string; // Unique link to display trade.

  // to delete or change
  name: string; // token.from.name + ' <> ' + token.to.name
  network: string;
  state: string;
  contract_state: 'ACTIVE';
  contract_type: 20;
  notification: false;
  permanent: false;
  is_rubic_order: true;
  rubic_initialized: true;
}
