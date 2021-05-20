import SwapToken from 'src/app/shared/models/tokens/SwapToken';

export enum GET_BNB_TRADE_STATUS {
  WAITING = 'WAITING',
  CALCULATION = 'CALCULATION',
  TX_IN_PROGRESS = 'TX_IN_PROGRESS',
  COMPLETED = 'COMPLETED'
}

export interface GetBnbTrade {
  status: GET_BNB_TRADE_STATUS;
  fromToken: SwapToken;
  fromAmount: string;
  toToken: SwapToken;
  toAmount: string;
}
