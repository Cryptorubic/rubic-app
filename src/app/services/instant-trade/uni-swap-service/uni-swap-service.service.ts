import { Injectable } from '@angular/core';
import InstantTradeService from '../InstantTradeService';
import InstantTrade from '../types/InstantTrade';
import {InstantTradeToken} from '../types';
import {ChainId, Fetcher, Route, Token, TokenAmount, Trade, TradeType} from '@uniswap/sdk';
import BigNumber from 'bignumber.js';

@Injectable({
  providedIn: 'root'
})
export class UniSwapServiceService extends InstantTradeService{

  constructor() {
    super();
  }

  async getTrade(fromAmount: BigNumber, fromToken: InstantTradeToken, toToken: InstantTradeToken, chainId?): Promise<InstantTrade> {
    const uniSwapFromToken = new Token(chainId || ChainId.MAINNET, fromToken.address, fromToken.decimals);
    const uniSwapToToken = new Token(chainId || ChainId.MAINNET, toToken.address, toToken.decimals);

    const pair = await Fetcher.fetchPairData(uniSwapFromToken, uniSwapToToken);
    const route = new Route([pair], uniSwapFromToken);

    console.log(route);
    console.log(route.midPrice.toSignificant(6));
    console.log(route.midPrice.invert().toSignificant(6));

    const trade = new Trade(route, new TokenAmount(uniSwapFromToken, fromAmount.toString()), TradeType.EXACT_INPUT);
    console.log(trade.executionPrice.toSignificant(6));

      return Promise.resolve(null)
  }

  getGasFee(fromAmount: BigNumber) {

  }

  async createTrade(trade: InstantTrade, onConfirm: Function): Promise<void> {
    return Promise.resolve(undefined);
  }

  getToAmount(fromAmount: BigNumber) {
  }
}
