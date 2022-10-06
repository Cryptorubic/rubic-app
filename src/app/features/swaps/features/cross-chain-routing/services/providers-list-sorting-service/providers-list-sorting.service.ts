import { Injectable } from '@angular/core';
import { WrappedCrossChainTrade } from 'rubic-sdk/lib/features/cross-chain/providers/common/models/wrapped-cross-chain-trade';
import { CrossChainManager, MaxAmountError, MinAmountError } from 'rubic-sdk';
import { RankedTaggedProviders } from '@features/swaps/features/cross-chain-routing/components/providers-list/models/ranked-tagged-providers';

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

  public static sortProviders(
    providers: readonly (WrappedCrossChainTrade & { rank: number })[]
  ): readonly (WrappedCrossChainTrade & { rank: number })[] {
    const trades = [...providers];
    trades.sort((a, b) => {
      if (a.rank === 0 || !a.trade) {
        return 1;
      }
      if (!b.trade) {
        return -1;
      }
      const bestProvider = CrossChainManager.chooseBestProvider(a, b);
      return a.tradeType === bestProvider.tradeType ? -1 : 1;
    });
    return trades;
  }
}
