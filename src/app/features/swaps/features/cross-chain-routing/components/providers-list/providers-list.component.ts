import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Output,
  EventEmitter
} from '@angular/core';
import { CrossChainRoutingService } from '@features/swaps/features/cross-chain-routing/services/cross-chain-routing-service/cross-chain-routing.service';
import { map, switchMap } from 'rxjs/operators';
import { forkJoin, combineLatest } from 'rxjs';
import { CrossChainManager, CrossChainTradeType } from 'rubic-sdk';
import { WrappedCrossChainTrade } from 'rubic-sdk/lib/features/cross-chain/providers/common/models/wrapped-cross-chain-trade';
import { SmartRouting } from '@features/swaps/features/cross-chain-routing/services/cross-chain-routing-service/models/smart-routing.interface';
import { CrossChainMaxAmountError } from 'rubic-sdk/lib/common/errors/cross-chain/cross-chain-max-amount.error';
import { CrossChainMinAmountError } from 'rubic-sdk/lib/common/errors/cross-chain/cross-chain-min-amount.error';
import { ProvidersListSortingService } from '@features/swaps/features/cross-chain-routing/services/providers-list-sorting-service/providers-list-sorting.service';
import { ProvidersSort } from '@features/swaps/features/cross-chain-routing/components/providers-list-sorting/models/providers-sort';

@Component({
  selector: 'app-providers-list',
  templateUrl: './providers-list.component.html',
  styleUrls: ['./providers-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProvidersListComponent {
  @Output() public readonly selectionHandler = new EventEmitter<void>();

  public readonly providers$ = combineLatest([
    this.crossChainService.allProviders$,
    this.providersListService.currentSortingType$
  ]).pipe(
    map(([allProviders, sorting]) => {
      const providers: readonly (WrappedCrossChainTrade & { rank: number })[] = allProviders.data;
      const trades = [...providers].filter(provider => Boolean(provider.trade));
      return ProvidersListComponent.sortProviders(trades, sorting);
    })
  );

  public readonly smartRoutingList$ = this.providers$.pipe(
    switchMap(providers => {
      return forkJoin(
        providers.map(provider => this.crossChainService.calculateSmartRouting(provider))
      );
    })
  );

  public readonly selectedProvider$ = this.crossChainService.selectedProvider$;

  public getMinMaxError(provider: WrappedCrossChainTrade): string {
    const error = provider.error;
    if (error instanceof CrossChainMaxAmountError) {
      return `Max: ${error.maxAmount.toFixed(3)}`;
    }
    if (error instanceof CrossChainMinAmountError) {
      return `Min: ${error.minAmount.toFixed(3)}`;
    }
  }

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly crossChainService: CrossChainRoutingService,
    private readonly providersListService: ProvidersListSortingService
  ) {}

  public selectProvider(tradeType: CrossChainTradeType): void {
    this.crossChainService.setSelectedProvider(tradeType);
    this.selectionHandler.emit();
  }

  public async publicGetSmartRouting(provider: WrappedCrossChainTrade): Promise<SmartRouting> {
    return this.crossChainService.calculateSmartRouting(provider);
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
