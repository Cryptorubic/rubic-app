import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Output,
  EventEmitter
} from '@angular/core';
import { CrossChainRoutingService } from '@features/swaps/features/cross-chain-routing/services/cross-chain-routing-service/cross-chain-routing.service';
import { switchMap } from 'rxjs/operators';
import { forkJoin } from 'rxjs';
import { CrossChainTradeType, MaxAmountError, MinAmountError } from 'rubic-sdk';
import { WrappedCrossChainTrade } from 'rubic-sdk/lib/features/cross-chain/providers/common/models/wrapped-cross-chain-trade';
import { fadeAnimation, listAnimation } from '@shared/utils/utils';
import { RankedTaggedProviders } from '@features/swaps/features/cross-chain-routing/components/providers-list/models/ranked-tagged-providers';

@Component({
  selector: 'app-providers-list',
  templateUrl: './providers-list.component.html',
  styleUrls: ['./providers-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fadeAnimation, listAnimation]
})
export class ProvidersListComponent {
  @Output() public readonly selectionHandler = new EventEmitter<void>();

  public readonly selectedProvider$ = this.crossChainService.selectedProvider$;

  public readonly providers$ = this.crossChainService.providers$;

  public readonly smartRoutingList$ = this.providers$.pipe(
    switchMap(providers => {
      return forkJoin(
        providers.map(provider => this.crossChainService.calculateSmartRouting(provider))
      );
    })
  );

  public getMinMaxError(provider: WrappedCrossChainTrade): string {
    const error = provider.error;
    if (error instanceof MaxAmountError) {
      return `Max: ${error.maxAmount.toFixed(2)}`;
    }
    if (error instanceof MinAmountError) {
      return `Min: ${error.minAmount.toFixed(2)}`;
    }
  }

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly crossChainService: CrossChainRoutingService
  ) {}

  public selectProvider(tradeType: CrossChainTradeType): void {
    this.crossChainService.setSelectedProvider(tradeType);
    this.selectionHandler.emit();
  }

  public trackByType(_index: number, provider: RankedTaggedProviders): CrossChainTradeType {
    return provider.tradeType;
  }
}
