import { Injectable } from '@angular/core';
import {
  compareCrossChainTrades,
  MaxAmountError,
  MinAmountError,
  WrappedCrossChainTrade
} from 'rubic-sdk';
import { RankedTaggedProviders } from '@features/swaps/features/cross-chain/components/cross-chain-bottom-form/components/best-trade-panel/components/trades-list/models/ranked-tagged-providers';

@Injectable({
  providedIn: 'root'
})
export class ProvidersListSortingService {
  public static setTags(
    sortedProviders: readonly (WrappedCrossChainTrade & { rank: number })[]
  ): RankedTaggedProviders[] {
    return sortedProviders.map((provider, index) => {
      return {
        ...provider,
        tags: {
          best: index === 0,
          minAmountWarning: provider.error instanceof MinAmountError,
          maxAmountWarning: provider.error instanceof MaxAmountError
        }
      };
    });
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
