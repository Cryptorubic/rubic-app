import { GetBnbToken } from 'src/app/features/cross-chain-swaps-page/get-bnb-page/models/GetBnbToken';
import SwapToken from 'src/app/shared/models/tokens/SwapToken';

export enum GET_BNB_TRADE_STATUS {
  WAITING = 'WAITING',
  CALCULATION = 'CALCULATION',
  TX_IN_PROGRESS = 'TX_IN_PROGRESS',
  COMPLETED = 'COMPLETED'
}

export interface GetBnbTrade {
  status: GET_BNB_TRADE_STATUS;
  fromToken: GetBnbToken;
  toToken: SwapToken;
}
