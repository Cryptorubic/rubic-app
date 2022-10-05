import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ProvidersSort } from '@features/swaps/features/cross-chain-routing/components/providers-list-sorting/models/providers-sort';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { StoreService } from '@core/services/store/store.service';
import { WrappedCrossChainTrade } from 'rubic-sdk/lib/features/cross-chain/providers/common/models/wrapped-cross-chain-trade';
import { CrossChainManager, MaxAmountError, MinAmountError } from 'rubic-sdk';
import { RankedTaggedProviders } from '@features/swaps/features/cross-chain-routing/components/providers-list/models/ranked-tagged-providers';

@Injectable({
  providedIn: 'root'
})
export class ProvidersListSortingService {
  private readonly defaultSortType: ProvidersSort =
    this.storeService.getItem('sortingType') || 'smart';

  private readonly _currentSortingType$ = new BehaviorSubject<ProvidersSort>(this.defaultSortType);

  public readonly currentSortingType$ = this._currentSortingType$
    .asObservable()
    .pipe(distinctUntilChanged());

  private readonly _visibleSortingType$ = new BehaviorSubject<ProvidersSort>(this.defaultSortType);

  public readonly visibleSortingType$ = this._visibleSortingType$
    .asObservable()
    .pipe(debounceTime(100));

  constructor(private readonly storeService: StoreService) {}

  public setCurrentSortingType(type: ProvidersSort): void {
    this.storeService.setItem('sortingType', type);
    if (this._currentSortingType$.value !== type) {
      this._currentSortingType$.next(type);
    }
  }

  public setVisibleSortingType(type?: ProvidersSort): void {
    if (type) {
      this._visibleSortingType$.next(type);
    } else {
      this._visibleSortingType$.next(this._currentSortingType$.value);
    }
  }

  public static setTags(
    sortedProviders: readonly (WrappedCrossChainTrade & { rank: number })[]
  ): RankedTaggedProviders[] {
    return sortedProviders.map((provider, index, allProviders) => {
      const similarTrade = allProviders.find(
        el =>
          el.tradeType !== provider.tradeType &&
          el.trade.to.tokenAmount.eq(provider.trade.to.tokenAmount)
      );
      return {
        ...provider,
        tags: {
          best: index === 0,
          minAmountWarning: provider.error instanceof MinAmountError,
          maxAmountWarning: provider.error instanceof MaxAmountError,
          similarTrade: Boolean(similarTrade)
        }
      };
    });
  }

  public static sortProviders(
    providers: readonly (WrappedCrossChainTrade & { rank: number })[],
    type: ProvidersSort
  ): readonly (WrappedCrossChainTrade & { rank: number })[] {
    const trades = [...providers];
    if (type === 'smart') {
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
    } else {
      trades.sort((a, b) => {
        if (a.rank === 0 || !a.trade) {
          return 1;
        }
        if (!b.trade) {
          return -1;
        }
        return b.trade.to.tokenAmount.comparedTo(a.trade.to.tokenAmount);
      });
    }
    return trades;
  }
}
