import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { TRADES_PROVIDERS } from '@app/features/swaps/shared/constants/trades-providers/trades-providers';
import { INSTANT_TRADE_STATUS } from '../../../../models/instant-trades-trade-status';
import { BLOCKCHAIN_NAME, EvmOnChainTrade } from 'rubic-sdk';
import { InstantTradeProviderData } from '../../../../models/providers-controller-data';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { TuiDialogContext } from '@taiga-ui/core';
import { TradePanelData } from '../provider-panel/models/trade-panel-data';
import { InstantTradeService } from '@features/swaps/features/instant-trade/services/instant-trade-service/instant-trade.service';

@Component({
  selector: 'app-providers-list-mobile',
  templateUrl: './providers-list-mobile.component.html',
  styleUrls: ['./providers-list-mobile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [InstantTradeService]
})
export class ProvidersListMobileComponent {
  public providersData: (InstantTradeProviderData & TradePanelData)[];

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: TuiDialogContext<InstantTradeProviderData, InstantTradeProviderData[]>
  ) {
    this.providersData = this.getProvidersData();
  }

  private getProvidersData(): (InstantTradeProviderData & TradePanelData)[] {
    const providers = this.context.data;

    if (!providers) return [];

    return providers
      .map(provider => ({
        ...provider,
        image: TRADES_PROVIDERS[provider.name].image,
        hasError: provider.tradeStatus === INSTANT_TRADE_STATUS.ERROR,
        loading:
          provider.tradeStatus === INSTANT_TRADE_STATUS.CALCULATION ||
          provider.tradeStatus === INSTANT_TRADE_STATUS.TX_IN_PROGRESS,
        ...(provider.trade instanceof EvmOnChainTrade &&
        provider.trade.gasFeeInfo?.gasLimit?.isFinite()
          ? {
              gasLimit: provider.trade.gasFeeInfo.gasLimit.toFixed(),
              gasFeeInUsd: provider.trade.gasFeeInfo.gasFeeInUsd,
              gasFeeInEth: provider.trade.gasFeeInfo.gasFeeInEth
            }
          : {}),
        amount: provider?.trade?.to.tokenAmount,
        showGas: provider?.trade?.from.blockchain === BLOCKCHAIN_NAME.ETHEREUM,
        blockchain: provider?.trade?.from.blockchain
      }))
      .filter(provider => !provider.hasError);
  }

  public selectProvider(provider: InstantTradeProviderData): void {
    this.context.completeWith(provider);
  }
}
