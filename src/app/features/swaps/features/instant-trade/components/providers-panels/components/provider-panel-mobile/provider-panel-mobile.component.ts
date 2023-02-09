import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { ERROR_TYPE } from '@app/core/errors/models/error-type';
import { RubicError } from '@app/core/errors/models/rubic-error';
import { EvmOnChainTrade, OnChainTrade } from 'rubic-sdk';
import { INSTANT_TRADE_STATUS } from '../../../../models/instant-trades-trade-status';
import { InstantTradeProviderData } from '../../../../models/providers-controller-data';
import { ProviderPanelData } from '../provider-panel/models/provider-panel-data';
import { TradePanelData } from '../provider-panel/models/trade-panel-data';

@Component({
  selector: 'app-provider-panel-mobile',
  templateUrl: './provider-panel-mobile.component.html',
  styleUrls: ['./provider-panel-mobile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProviderPanelMobileComponent implements OnInit {
  @Input() public providerData: InstantTradeProviderData;

  @Input() public loading: boolean;

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
      appearance: 'normal'
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
}
