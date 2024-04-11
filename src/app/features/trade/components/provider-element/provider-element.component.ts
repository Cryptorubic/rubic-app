import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TradeState } from '@features/trade/models/trade-state';
import BigNumber from 'bignumber.js';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import {
  CrossChainTradeType,
  EvmCrossChainTrade,
  EvmOnChainTrade,
  FeeInfo,
  nativeTokensList
} from 'rubic-sdk';
import { PlatformConfigurationService } from '@core/services/backend/platform-configuration/platform-configuration.service';
import { Token } from '@shared/models/tokens/token';
import { TradeProvider } from '@features/trade/models/trade-provider';
import { ProviderInfo } from '@features/trade/models/provider-info';
import { TRADES_PROVIDERS } from '@features/trade/constants/trades-providers';
import { TokensStoreService } from '@core/services/tokens/tokens-store.service';
import { compareTokens } from '@shared/utils/utils';
import { BLOCKCHAIN_NAME } from 'rubic-sdk/lib/core/blockchain/models/blockchain-name';
import { Web3Pure } from 'rubic-sdk/lib/core/blockchain/web3-pure/web3-pure';
import { isArbitrumBridgeRbcTrade } from '../../utils/is-arbitrum-bridge-rbc-trade';

@Component({
  selector: 'app-provider-element',
  templateUrl: './provider-element.component.html',
  styleUrls: ['./provider-element.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProviderElementComponent {
  @Input({ required: true }) tradeState: TradeState;

  @Input({ required: true }) toToken: TokenAmount;

  @Input({ required: true }) selectedTradeType: TradeProvider;

  @Input({ required: true }) isBest: boolean = false;

  @Input({ required: true }) shortedInfo: boolean = false;

  @Input({ required: true }) nativeToken: Token;

  public expanded = false;

  constructor(
    private readonly platformConfigurationService: PlatformConfigurationService,
    private readonly tokensStoreService: TokensStoreService
  ) {}

  public toggleExpand(event: Event): void {
    event.preventDefault();
    this.expanded = !this.expanded;
  }

  public getAverageTimeString(): string {
    if (isArbitrumBridgeRbcTrade(this.tradeState.trade)) {
      return '7 D';
    }

    const info = this.getProviderInfo(this.tradeState.tradeType);
    const time = `${info?.averageTime || 3} M`;

    return time;
  }

  public getProviderInfo(tradeProvider: TradeProvider): ProviderInfo {
    const provider = TRADES_PROVIDERS[tradeProvider];
    const providerAverageTime = this.platformConfigurationService.providersAverageTime;
    const currentProviderTime = providerAverageTime?.[tradeProvider as CrossChainTradeType];

    return {
      ...provider,
      averageTime: currentProviderTime ? currentProviderTime : provider.averageTime
    };
  }

  public getFeeInfo(): { fee: FeeInfo; nativeToken: Token } {
    const tradeInfo = this.tradeState.trade.getTradeInfo();
    return {
      fee: tradeInfo.feeInfo,
      nativeToken: this.nativeToken
    };
  }

  public getGasData(): { amount: BigNumber; amountInUsd: BigNumber; symbol: string } | null {
    const trade = this.tradeState.trade;
    let gasData = null;
    let gasPrice = null;
    if (trade instanceof EvmCrossChainTrade) {
      gasData = trade.gasData;

      if (
        trade.from.blockchain !== BLOCKCHAIN_NAME.ETHEREUM &&
        trade.from.blockchain !== BLOCKCHAIN_NAME.FANTOM
      ) {
        gasPrice = gasData?.gasPrice?.gt(0)
          ? Web3Pure.fromWei(gasData.gasPrice)
          : Web3Pure.fromWei(gasData?.maxFeePerGas || 0);
      } else {
        gasPrice = gasData?.gasPrice?.gt(0)
          ? gasData.gasPrice
          : Web3Pure.fromWei(gasData?.maxFeePerGas || 0);
      }
    } else if (trade instanceof EvmOnChainTrade) {
      gasData = trade.gasFeeInfo;
      gasPrice = gasData?.gasPrice.gt(0) ? gasData.gasPrice : gasData?.maxFeePerGas;
    }

    if (!gasData || !gasData.gasLimit) {
      return null;
    }
    const blockchain = trade.from.blockchain;
    const nativeToken = nativeTokensList[blockchain];
    const nativeTokenPrice = this.tokensStoreService.tokens.find(token =>
      compareTokens(token, { blockchain, address: nativeToken.address })
    ).price;
    const gasLimit = gasData?.gasLimit?.multipliedBy(gasPrice);

    return {
      amount: gasLimit,
      amountInUsd: gasLimit.multipliedBy(nativeTokenPrice),
      symbol: nativeToken.symbol
    };
  }
}
