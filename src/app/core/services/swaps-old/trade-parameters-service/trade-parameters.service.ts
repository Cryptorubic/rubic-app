import { Injectable } from '@angular/core';
import { BLOCKCHAIN_NAME } from '../../../../shared/models/blockchain/BLOCKCHAIN_NAME';
import { TradeParameters } from '../../../../shared/models/swaps/TradeParameters';

type Trades = { [key in BLOCKCHAIN_NAME]: TradeParameters };

@Injectable({
  providedIn: 'root'
})
export class TradeParametersService {
  private readonly _tradesParameters: Trades;

  public getTradeParameters(blockchain: BLOCKCHAIN_NAME): TradeParameters {
    return this._tradesParameters[blockchain];
  }

  public setTradeParameters(blockchain: BLOCKCHAIN_NAME, tradeParameters: TradeParameters) {
    this._tradesParameters[blockchain] = tradeParameters;
  }

  constructor() {
    this._tradesParameters = Object.values(BLOCKCHAIN_NAME).reduce(
      (acc, blockchain) => ({
        ...acc,
        [blockchain]: {
          fromToken: null,
          toToken: null,
          fromAmount: null,
          toAmount: null,

          isCustomFromTokenFormOpened: false,
          isCustomToTokenFormOpened: false,
          customFromTokenAddress: null,
          customToTokenAddress: null
        }
      }),
      {} as Trades
    );
  }
}
