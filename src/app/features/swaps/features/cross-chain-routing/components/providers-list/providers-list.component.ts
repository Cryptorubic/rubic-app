import { Component, ChangeDetectionStrategy, ChangeDetectorRef, Inject } from '@angular/core';
import { CrossChainRoutingService } from '@features/swaps/features/cross-chain-routing/services/cross-chain-routing-service/cross-chain-routing.service';
import { map, switchMap } from 'rxjs/operators';
import { forkJoin, combineLatest } from 'rxjs';
import { CrossChainManager, CrossChainTradeType } from 'rubic-sdk';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { TuiDialogContext } from '@taiga-ui/core';
import { WrappedCrossChainTrade } from 'rubic-sdk/lib/features/cross-chain/providers/common/models/wrapped-cross-chain-trade';
import { SmartRouting } from '@features/swaps/features/cross-chain-routing/services/cross-chain-routing-service/models/smart-routing.interface';
import { CrossChainMaxAmountError } from 'rubic-sdk/lib/common/errors/cross-chain/cross-chain-max-amount.error';
import { CrossChainMinAmountError } from 'rubic-sdk/lib/common/errors/cross-chain/cross-chain-min-amount.error';
import { ProvidersListSortingService } from '@features/swaps/features/cross-chain-routing/services/providers-list-sorting-service/providers-list-sorting.service';

@Component({
  selector: 'polymorpheus-providers-list',
  templateUrl: './providers-list.component.html',
  styleUrls: ['./providers-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProvidersListComponent {
  public readonly providers$ = combineLatest([
    this.crossChainService.allProviders$,
    this.providersListService.currentSortingType$
  ]).pipe(
    map(([allProviders, sorting]) => {
      const providers: readonly (WrappedCrossChainTrade & { rank: number })[] = allProviders.data;
      const trades = providers.filter(provider => Boolean(provider.trade));
      if (sorting === 'smart') {
        return trades.sort((a, b) => {
          if (b.rank === 0) {
            return 1;
          }
          const bestProvider = CrossChainManager.chooseBestProvider(a, b);
          return a.tradeType === bestProvider.tradeType ? 1 : -1;
        });
      }
      return trades.sort((a, b) => {
        if (a.rank === 0) {
          return 1;
        }
        b.trade.to.tokenAmount.comparedTo(a.trade.to.tokenAmount);
      });
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
    private readonly providersListService: ProvidersListSortingService,
    @Inject(POLYMORPHEUS_CONTEXT) private readonly context: TuiDialogContext
  ) {}

  public selectProvider(tradeType: CrossChainTradeType): void {
    this.crossChainService.setSelectedProvider(tradeType);
    this.context.completeWith();
  }

  public async publicGetSmartRouting(provider: WrappedCrossChainTrade): Promise<SmartRouting> {
    return this.crossChainService.calculateSmartRouting(provider);
  }
}
