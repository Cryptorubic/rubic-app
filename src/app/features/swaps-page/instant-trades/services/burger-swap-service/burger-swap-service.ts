import { Injectable } from '@angular/core';
// import BigNumber from 'bignumber.js';
import { TransactionReceipt } from 'web3-eth';
import InstantTradeService from '../InstantTradeService';
// import InstantTradeToken from '../../models/InstantTradeToken';
import InstantTrade from '../../models/InstantTrade';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class BurgerSwapService extends InstantTradeService {
  constructor(protected readonly translateService: TranslateService) {
    super(translateService);
  }

  /** Unused params
    fromAmount: BigNumber,
    fromToken: InstantTradeToken,
    toToken
  */
  async calculateTrade(): Promise<InstantTrade> {
    return new Promise(resolve => resolve(undefined));
  }

  /** Unused params
    trade: InstantTrade,
    options: { onConfirm?: (hash: string) => void; onApprove?: (hash: string | null) => void }
  */
  async createTrade(): Promise<TransactionReceipt> {
    return new Promise(resolve => resolve(undefined));
  }
}
