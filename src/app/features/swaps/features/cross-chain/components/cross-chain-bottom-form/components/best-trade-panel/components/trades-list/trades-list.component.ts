import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Output,
  EventEmitter,
  Input
} from '@angular/core';
import { CrossChainCalculationService } from '@features/swaps/features/cross-chain/services/cross-chain-calculation-service/cross-chain-calculation.service';
import {
  CrossChainTradeType,
  MaxAmountError,
  MinAmountError,
  WrappedCrossChainTrade
} from 'rubic-sdk';
import { fadeAnimation, listAnimation } from '@shared/utils/utils';
import { CrossChainTaggedTrade } from '@features/swaps/features/cross-chain/models/cross-chain-tagged-trade';
import { CrossChainRoute } from '@features/swaps/features/cross-chain/models/cross-chain-route';

@Component({
  selector: 'app-trades-list',
  templateUrl: './trades-list.component.html',
  styleUrls: ['./trades-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fadeAnimation, listAnimation]
})
export class TradesListComponent {
  @Input() public set providers(value: CrossChainTaggedTrade[]) {
    this._providers = value;
    this.smartRoutingList = this._providers?.map(provider =>
      this.crossChainService.parseRoute(provider)
    );
  }

  public get providers(): CrossChainTaggedTrade[] {
    return this._providers;
  }

  @Output() public readonly selectionHandler = new EventEmitter<void>();

  public readonly selectedProvider$ = this.crossChainService.selectedProvider$;

  public smartRoutingList: CrossChainRoute[];

  private _providers: CrossChainTaggedTrade[];

  public getMinMaxError(provider: WrappedCrossChainTrade): string {
    const error = provider.error;
    const isUsd =
      (error instanceof MinAmountError || error instanceof MinAmountError) &&
      error.tokenSymbol !== provider.trade.from.symbol &&
      error.tokenSymbol === 'USDC';

    if (error instanceof MaxAmountError) {
      return `Max: ${error.maxAmount.toFixed(2)}${isUsd ? '$' : ''}`;
    }
    if (error instanceof MinAmountError) {
      return `Min: ${error.minAmount.toFixed(2)}${isUsd ? '$' : ''}`;
    }
  }

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly crossChainService: CrossChainCalculationService
  ) {}

  public selectProvider(tradeType: CrossChainTradeType): void {
    this.crossChainService.setSelectedProvider(tradeType);
    this.selectionHandler.emit();
  }

  public trackByType(_index: number, provider: CrossChainTaggedTrade): CrossChainTradeType {
    return provider.tradeType;
  }
}
