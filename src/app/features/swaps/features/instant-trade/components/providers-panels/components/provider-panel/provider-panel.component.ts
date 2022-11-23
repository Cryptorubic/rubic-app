import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { INSTANT_TRADE_STATUS } from '@features/swaps/features/instant-trade/models/instant-trades-trade-status';
import { InstantTradeProviderData } from '@features/swaps/features/instant-trade/models/providers-controller-data';
import { TradePanelData } from '@features/swaps/features/instant-trade/components/providers-panels/components/provider-panel/models/trade-panel-data';
import { RubicError } from '@core/errors/models/rubic-error';
import { ERROR_TYPE } from '@core/errors/models/error-type';
import { ProviderPanelData } from '@features/swaps/features/instant-trade/components/providers-panels/components/provider-panel/models/provider-panel-data';
import { EvmOnChainTrade, OnChainTrade } from 'rubic-sdk';

@Component({
  selector: 'app-provider-panel',
  templateUrl: './provider-panel.component.html',
  styleUrls: ['./provider-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProviderPanelComponent implements OnInit {
  @Input() public providerData: InstantTradeProviderData;

  @Input() public isBestProvider = false;

  @Output() private onSelectProvider = new EventEmitter<void>();

  public tradePanelData: TradePanelData;

  public providerPanelData: ProviderPanelData;

  public errorTranslateKey: string;

  ngOnInit() {
    this.setupProviderPanelData();
  }

  private setupProviderPanelData(): void {
    const data = this.providerData;
    const hasError = data.tradeStatus === INSTANT_TRADE_STATUS.ERROR;
    this.providerPanelData = {
      label: data.label,
      isSelected: data.isSelected,
      hasError,
      loading:
        data.tradeStatus === INSTANT_TRADE_STATUS.CALCULATION ||
        data.tradeStatus === INSTANT_TRADE_STATUS.TX_IN_PROGRESS,
      appearance: this.isBestProvider ? 'normal' : 'small'
    };

    if (hasError) {
      this.setupError(data.error);
    } else if (data.trade) {
      this.setupTradePanelData(data.trade);
    }
  }

  private setupTradePanelData(trade: OnChainTrade): void {
    const gas =
      trade instanceof EvmOnChainTrade && trade.gasFeeInfo?.gasLimit?.isFinite()
        ? {
            gasLimit: trade.gasFeeInfo.gasLimit.toFixed(),
            gasFeeInUsd: trade.gasFeeInfo.gasFeeInUsd,
            gasFeeInEth: trade.gasFeeInfo.gasFeeInEth
          }
        : {};

    this.tradePanelData = {
      blockchain: trade.from.blockchain,
      amount: trade.to.tokenAmount,
      ...gas
    };
  }

  private setupError(error: RubicError<ERROR_TYPE>): void {
    this.errorTranslateKey =
      error?.type === ERROR_TYPE.TEXT ? error.translateKey || error.message : 'errors.rubicError';
  }

  /**
   * Emits provider selection event to parent component.
   */
  public selectProvider(): void {
    if (!this.providerPanelData.hasError && !this.providerPanelData.loading) {
      this.onSelectProvider.emit();
    }
  }
}
