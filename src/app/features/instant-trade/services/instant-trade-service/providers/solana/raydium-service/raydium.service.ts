import { Injectable } from '@angular/core';
import {
  ItOptions,
  ItProvider
} from '@features/instant-trade/services/instant-trade-service/models/ItProvider';
import InstantTrade from '@features/instant-trade/models/InstantTrade';
import { TransactionReceipt } from 'web3-eth';
import InstantTradeToken from '@features/instant-trade/models/InstantTradeToken';
import BigNumber from 'bignumber.js';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RaydiumService implements ItProvider {
  constructor() {}

  createTrade(trade: InstantTrade, options: ItOptions): Promise<TransactionReceipt> {
    console.log(trade, options);
    return null;
  }

  calculateTrade(
    fromToken: InstantTradeToken,
    fromAmount: BigNumber,
    toToken: InstantTradeToken,
    shouldCalculateGas: boolean
  ): Promise<InstantTrade> {
    console.log(fromToken, fromAmount, toToken, shouldCalculateGas);
    return null;
  }

  getAllowance(tokenAddress: string): Observable<BigNumber> {
    console.log(tokenAddress);
    return null;
  }

  approve(
    tokenAddress: string,
    options: {
      onTransactionHash?: (hash: string) => void;
    }
  ): Promise<void> {
    console.log(tokenAddress, options);
    return null;
  }
}
