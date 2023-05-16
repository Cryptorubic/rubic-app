import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  OnChanges
} from '@angular/core';
import { INSTANT_TRADE_STATUS } from '@features/swaps/features/instant-trade/models/instant-trades-trade-status';
import { InstantTradeProviderData } from '@features/swaps/features/instant-trade/models/providers-controller-data';
import { TradePanelData } from '@features/swaps/features/instant-trade/components/providers-panels/components/provider-panel/models/trade-panel-data';
import { RubicError } from '@core/errors/models/rubic-error';
import { ERROR_TYPE } from '@core/errors/models/error-type';
import { ProviderPanelData } from '@features/swaps/features/instant-trade/components/providers-panels/components/provider-panel/models/provider-panel-data';
import { BLOCKCHAIN_NAME, EvmOnChainTrade, OnChainTrade } from 'rubic-sdk';
import { TRADES_PROVIDERS } from '@app/features/swaps/shared/constants/trades-providers/trades-providers';
import { NgChanges } from '@app/shared/models/utility-types/ng-changes';

@Component({
  selector: 'app-provider-panel',
  templateUrl: './provider-panel.component.html',
  styleUrls: ['./provider-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProviderPanelComponent implements OnInit, OnChanges {
  @Input() public isBestProvider: boolean;

  private _providerData: InstantTradeProviderData;

  @Input() set providerData(providerData: InstantTradeProviderData) {
    this._providerData = providerData;
    this.setupProviderPanelData();
  }

  public get providerData(): InstantTradeProviderData {
    return this._providerData;
  }

  @Output() private onSelectProvider = new EventEmitter<void>();

  public tradePanelData: TradePanelData;

  public providerPanelData: ProviderPanelData;

  public errorTranslateKey: string;

  ngOnInit() {
    this.setupProviderPanelData();
  }

  ngOnChanges(changes: NgChanges<ProviderPanelComponent>) {
    if (changes.providerData) {
      this.setupProviderPanelData();
    }
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
      appearance: this.isBestProvider || data?.fullSize ? 'normal' : 'small',
      image: TRADES_PROVIDERS[data.name].image
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
      ...gas,
      showGas: trade.from.blockchain === BLOCKCHAIN_NAME.ETHEREUM
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
