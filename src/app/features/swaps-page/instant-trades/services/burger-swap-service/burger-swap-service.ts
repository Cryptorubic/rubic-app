import { Injectable } from '@angular/core';
import BigNumber from 'bignumber.js';
import { TransactionReceipt } from 'web3-eth';
import InstantTradeService from '../InstantTradeService';
import InstantTradeToken from '../../models/InstantTradeToken';
import InstantTrade from '../../models/InstantTrade';

@Injectable()
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
