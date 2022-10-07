import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Output,
  EventEmitter,
  Input
} from '@angular/core';
import { CrossChainRoutingService } from '@features/swaps/features/cross-chain-routing/services/cross-chain-routing-service/cross-chain-routing.service';
import {
  CrossChainTradeType,
  MaxAmountError,
  MinAmountError,
  WrappedCrossChainTrade
} from 'rubic-sdk';
import { fadeAnimation, listAnimation } from '@shared/utils/utils';
import { RankedTaggedProviders } from '@features/swaps/features/cross-chain-routing/components/providers-list/models/ranked-tagged-providers';
import { SmartRouting } from '../../services/cross-chain-routing-service/models/smart-routing.interface';

@Component({
  selector: 'app-providers-list',
  templateUrl: './providers-list.component.html',
  styleUrls: ['./providers-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fadeAnimation, listAnimation]
})
export class ProvidersListComponent {
  @Input() public set providers(value: RankedTaggedProviders[]) {
    this._providers = value;
    this.smartRoutingList = this._providers?.map(provider =>
      this.crossChainService.calculateSmartRouting(provider)
    );
  }

  public get providers(): RankedTaggedProviders[] {
    return this._providers;
  }

  @Output() public readonly selectionHandler = new EventEmitter<void>();

  public readonly selectedProvider$ = this.crossChainService.selectedProvider$;

  public smartRoutingList: SmartRouting[];

  private _providers: RankedTaggedProviders[];

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
