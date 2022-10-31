import { Injectable } from '@angular/core';
import {
  compareCrossChainTrades,
  MaxAmountError,
  MinAmountError,
  WrappedCrossChainTrade
} from 'rubic-sdk';
import { CrossChainTaggedTrade } from '@features/swaps/features/cross-chain/models/cross-chain-tagged-trade';
import { CrossChainCalculatedTrade } from '@features/swaps/features/cross-chain/models/cross-chain-calculated-trade';

@Injectable({
  providedIn: 'root'
})
export class ProvidersListSortingService {
  public static setTags(calculatedTrade: CrossChainCalculatedTrade): CrossChainTaggedTrade {
    return {
      ...calculatedTrade,
      tags: {
        minAmountWarning: calculatedTrade.error instanceof MinAmountError,
        maxAmountWarning: calculatedTrade.error instanceof MaxAmountError
      }
    };
  }

  public static sortTrades(
    trades: readonly (WrappedCrossChainTrade & { rank: number })[]
  ): readonly (WrappedCrossChainTrade & { rank: number })[] {
    return [...trades].sort((a, b) => {
      if (a.rank === 0) {
        return 1;
      }
      if (b.rank === 0) {
        return -1;
      }
      return compareCrossChainTrades(a, b);
    });
  }
}
