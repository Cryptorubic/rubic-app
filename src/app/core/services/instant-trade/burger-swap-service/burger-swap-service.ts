import { Injectable } from '@angular/core';
import InstantTradeService from '../InstantTradeService';
import BigNumber from 'bignumber.js';
import { InstantTrade, InstantTradeToken } from '../types';
import { TransactionReceipt } from 'web3-eth';

@Injectable({
  providedIn: 'root'
})
export class BurgerSwapService extends InstantTradeService {
  constructor() {
    super();
  }

  async calculateTrade(
    fromAmount: BigNumber,
    fromToken: InstantTradeToken,
    toToken
  ): Promise<InstantTrade> {
    return new Promise(resolve => resolve(undefined));
  }

  async createTrade(
    trade: InstantTrade,
    options: { onConfirm?: (hash: string) => void; onApprove?: (hash: string | null) => void }
  ): Promise<TransactionReceipt> {
    return new Promise(resolve => resolve(undefined));
  }
}
