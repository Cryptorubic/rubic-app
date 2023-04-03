import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Output,
  EventEmitter,
  Input,
  Inject,
  Optional
} from '@angular/core';
import { CrossChainTradeType, MaxAmountError, MinAmountError } from 'rubic-sdk';
import { fadeAnimation, listAnimation } from '@shared/utils/utils';
import { CrossChainTaggedTrade } from '@features/swaps/features/cross-chain/models/cross-chain-tagged-trade';
import { CrossChainFormService } from '@features/swaps/features/cross-chain/services/cross-chain-form-service/cross-chain-form.service';
import { ThemeService } from '@core/services/theme/theme.service';
import { PolymorpheusInput } from '@app/shared/decorators/polymorpheus-input';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { TuiDialogContext } from '@taiga-ui/core';
import { HeaderStore } from '@app/core/header/services/header.store';
import { TRADES_PROVIDERS } from '@app/features/swaps/shared/constants/trades-providers/trades-providers';
import { ProviderInfo } from '@app/features/swaps/shared/models/trade-provider/provider-info';

@Component({
  selector: 'app-trades-list',
  templateUrl: './trades-list.component.html',
  styleUrls: ['./trades-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fadeAnimation, listAnimation]
})
export class TradesListComponent {
  @PolymorpheusInput()
  @Input()
  taggedTrades: CrossChainTaggedTrade[];

  @Output() public readonly selectionHandler = new EventEmitter<void>();

  public readonly selectedTrade$ = this.crossChainFormService.selectedTrade$;

  public readonly theme$ = this.themeService.theme$;

  public readonly isMobile$ = this.headerStore.getMobileDisplayStatus();

  public readonly toToken = this.crossChainFormService.inputValue.toToken.symbol;

  constructor(
    @Optional()
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: TuiDialogContext<void, { taggedTrades: CrossChainTaggedTrade[] }>,
    private readonly cdr: ChangeDetectorRef,
    private readonly crossChainFormService: CrossChainFormService,
    private readonly themeService: ThemeService,
    private readonly headerStore: HeaderStore
  ) {}

  public getMinMaxError(taggedTrade: CrossChainTaggedTrade): string {
    const error = taggedTrade.error;
    const isUsd =
      (error instanceof MinAmountError || error instanceof MinAmountError) &&
      error.tokenSymbol.toLowerCase().includes('usd');

    if (error instanceof MaxAmountError) {
      return `Max: ${error.maxAmount.toFixed(2)}${isUsd ? '$' : ''}`;
    }
    if (error instanceof MinAmountError) {
      return `Min: ${error.minAmount.toFixed(2)}${isUsd ? '$' : ''}`;
    }
  }

  public selectTrade(taggedTrade: CrossChainTaggedTrade): void {
    this.crossChainFormService.updateSelectedTrade(taggedTrade, true);
    this.selectionHandler.emit();
    if (this.context) {
      this.context.completeWith();
    }
  }

  public trackByType(_index: number, taggedTrade: CrossChainTaggedTrade): CrossChainTradeType {
    return taggedTrade.tradeType;
  }

  public getProviderInfo(trade: CrossChainTaggedTrade): ProviderInfo {
    return TRADES_PROVIDERS[trade?.route?.bridgeProvider];
  }
}
