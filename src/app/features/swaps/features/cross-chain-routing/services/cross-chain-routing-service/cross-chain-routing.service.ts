import { Injectable } from '@angular/core';
import { TradeService } from '@features/swaps/core/services/trade-service/trade.service';
import {
  BlockchainName,
  CelerRubicCrossChainTrade,
  compareAddresses,
  CROSS_CHAIN_TRADE_TYPE,
  CrossChainIsUnavailableError,
  LowSlippageError,
  RubicSdkError
} from 'rubic-sdk';
import { RubicCrossChainTradeProvider } from 'rubic-sdk/lib/features/cross-chain/providers/rubic-trade-provider/rubic-cross-chain-trade-provider';
import { CelerCrossChainTradeProvider } from 'rubic-sdk/lib/features/cross-chain/providers/celer-trade-provider/celer-cross-chain-trade-provider';
import { SymbiosisCrossChainTradeProvider } from 'rubic-sdk/lib/features/cross-chain/providers/symbiosis-trade-provider/symbiosis-cross-chain-trade-provider';
import { WrappedCrossChainTrade } from 'rubic-sdk/lib/features/cross-chain/providers/common/models/wrapped-cross-chain-trade';
import { RubicSdkService } from '@features/swaps/core/services/rubic-sdk-service/rubic-sdk.service';
import { SwapFormService } from '@features/swaps/features/main-form/services/swap-form-service/swap-form.service';
import { SettingsService } from '@features/swaps/features/main-form/services/settings-service/settings.service';
import { RubicError } from '@core/errors/models/rubic-error';
import { WalletConnectorService } from '@core/services/blockchain/wallets/wallet-connector-service/wallet-connector.service';
import {
  CelerRubicTradeInfo,
  SymbiosisTradeInfo
} from '@features/swaps/features/cross-chain-routing/services/cross-chain-routing-service/models/cross-chain-trade-info';
import { PriceImpactService } from '@core/services/price-impact/price-impact.service';
import { SymbiosisCrossChainTrade } from 'rubic-sdk/lib/features/cross-chain/providers/symbiosis-trade-provider/symbiosis-cross-chain-trade';
import { SmartRouting } from '@features/swaps/features/cross-chain-routing/services/cross-chain-routing-service/models/smart-routing.interface';
import CrossChainIsUnavailableWarning from '@core/errors/models/cross-chain-routing/cross-chainIs-unavailable-warning';
import { ERROR_TYPE } from '@core/errors/models/error-type';
import { CrossChainMinAmountError } from 'rubic-sdk/lib/common/errors/cross-chain/cross-chain-min-amount.error';
import { CrossChainMaxAmountError } from 'rubic-sdk/lib/common/errors/cross-chain/cross-chain-max-amount.error';
import { SwapManagerCrossChainCalculationOptions } from 'rubic-sdk/lib/features/cross-chain/models/swap-manager-cross-chain-options';
import { CrossChainOptions } from 'rubic-sdk/lib/features/cross-chain/models/cross-chain-options';
import { Subscription } from 'rxjs';
import { IframeService } from '@core/services/iframe/iframe.service';
import BigNumber from 'bignumber.js';
import { SWAP_PROVIDER_TYPE } from '@features/swaps/features/main-form/models/swap-provider-type';
import { GoogleTagManagerService } from '@core/services/google-tag-manager/google-tag-manager.service';
import { CrossChainRoutingApiService } from '@core/services/backend/cross-chain-routing-api/cross-chain-routing-api.service';

@Injectable({
  providedIn: 'root'
})
export class CrossChainRoutingService extends TradeService {
  private readonly defaultTimeout = 20_000;

  public crossChainTrade: WrappedCrossChainTrade;

  public smartRouting: SmartRouting;

  public static isSupportedBlockchain(blockchainName: BlockchainName): boolean {
    return (
      RubicCrossChainTradeProvider.isSupportedBlockchain(blockchainName) ||
      CelerCrossChainTradeProvider.isSupportedBlockchain(blockchainName) ||
      SymbiosisCrossChainTradeProvider.isSupportedBlockchain(blockchainName)
    );
  }

  constructor(
    private readonly sdk: RubicSdkService,
    private readonly swapFormService: SwapFormService,
    private readonly settingsService: SettingsService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly iframeService: IframeService,
    private readonly gtmService: GoogleTagManagerService,
    private readonly apiService: CrossChainRoutingApiService
  ) {
    super('cross-chain-routing');
  }

  public async calculateTrade(_needApprove?: boolean): Promise<WrappedCrossChainTrade> {
    try {
      const { fromToken, fromAmount, toToken } = this.swapFormService.inputValue;
      const slippageTolerance = this.settingsService.crossChainRoutingValue.slippageTolerance / 100;
      const options: SwapManagerCrossChainCalculationOptions & CrossChainOptions = {
        fromSlippageTolerance: slippageTolerance / 2,
        toSlippageTolerance: slippageTolerance / 2,
        slippageTolerance,
        timeout: this.defaultTimeout
      };

      this.crossChainTrade = (
        await this.sdk.crossChain.calculateTrade(fromToken, fromAmount.toString(), toToken, options)
      )[0];
      const { trade, error } = this.crossChainTrade;
      await this.calculateSmartRouting();
      if (!trade && error instanceof RubicSdkError) {
        if (
          error instanceof CrossChainMinAmountError ||
          error instanceof CrossChainMaxAmountError
        ) {
          throw new RubicSdkError(error.message);
        }
        throw this.parseCalculcationError(this.crossChainTrade.error);
      }
    } catch (err) {
      console.log(err);
      this.crossChainTrade = null;
      this.smartRouting = null;
      throw err;
    }
    return this.crossChainTrade;
  }

  public async createTrade(confirmCallback?: () => void): Promise<void> {
    await this.walletConnectorService.checkSettings(this.crossChainTrade.trade?.from?.blockchain);
    if (!this.crossChainTrade?.trade) {
      throw new RubicError('[RUBIC SDK] Cross chain trade object not found.');
    }
    this.checkDeviceAndShowNotification();

    let subscription$: Subscription;
    const onTransactionHash = (txHash: string) => {
      confirmCallback?.();
      this.notifyGtmAfterSignTx(txHash);
      subscription$ = this.notifyTradeInProgress(
        txHash,
        this.crossChainTrade.trade.f,
        this.crossChainTrade.tradeType
      );
    };

    await this.crossChainTrade.trade.swap({
      onConfirm: onTransactionHash
    });

    subscription$?.unsubscribe();
    this.showSuccessTrxNotification(this.crossChainTrade.tradeType);
  }

  /**
   * Gets trade info to show in transaction info panel.
   */
  public async getTradeInfo(): Promise<CelerRubicTradeInfo | SymbiosisTradeInfo> {
    if (!this.crossChainTrade?.trade) {
      return null;
    }

    const trade = this.crossChainTrade.trade;
    const { estimatedGas } = trade;

    if (
      trade instanceof SymbiosisCrossChainTrade &&
      trade.type === CROSS_CHAIN_TRADE_TYPE.SYMBIOSIS
    ) {
      return {
        estimatedGas,
        fee: trade.fee,
        feeSymbol: trade.feeSymbol,
        priceImpact: String(trade.priceImpact)
      };
    }

    if (trade instanceof CelerRubicCrossChainTrade) {
      const { fromTrade, toTrade, feeInPercents, cryptoFeeToken } =
        trade as CelerRubicCrossChainTrade;
      const fromProvider = fromTrade.provider.type;
      const toProvider = toTrade.provider.type;

      const feeAmount = toTrade.toTokenAmountMin
        .multipliedBy(feeInPercents)
        .dividedBy(1 - feeInPercents);

      const priceImpactFrom = PriceImpactService.calculatePriceImpact(
        fromTrade.fromToken.price,
        fromTrade.toToken.price,
        fromTrade.fromToken.tokenAmount,
        fromTrade.toToken.tokenAmount
      );

      const priceImpactTo = PriceImpactService.calculatePriceImpact(
        toTrade.fromToken.price,
        toTrade.toToken.price,
        toTrade.fromToken.tokenAmount,
        toTrade.toToken.tokenAmount
      );

      const fromPath: null = null;
      const toPath: null = null;

      // @TODO SDK
      // const fromPath = trade.fromTrade ? trade.fromTrade.path.map(token => token.symbol) : null;
      // const toPath = trade.toTrade ? trade.toTrade.path.map(token => token.symbol) : null;

      return {
        feePercent: feeInPercents,
        feeAmount,
        feeTokenSymbol: cryptoFeeToken.symbol,
        cryptoFee: cryptoFeeToken.tokenAmount,
        estimatedGas,
        priceImpactFrom: Number.isNaN(priceImpactFrom) ? 0 : priceImpactFrom,
        priceImpactTo: Number.isNaN(priceImpactTo) ? 0 : priceImpactTo,
        fromProvider,
        toProvider,
        fromPath,
        toPath,
        usingCelerBridge: trade.type === CROSS_CHAIN_TRADE_TYPE.CELER
      };
    }

    throw new RubicError('[RUBIC SDK] Unknown trade provider.');
  }

  private async calculateSmartRouting(): Promise<void> {
    if (!this.crossChainTrade?.trade) {
      this.smartRouting = null;
      return;
    }
    if (this.crossChainTrade.trade.type === CROSS_CHAIN_TRADE_TYPE.SYMBIOSIS) {
      this.smartRouting = {
        fromProvider: 'ONE_INCH_BSC',
        toProvider: 'ONE_INCH_ETHEREUM',
        fromHasTrade: true,
        toHasTrade: true
      };
    } else {
      this.smartRouting = {
        fromProvider: this.crossChainTrade.trade.itType.from,
        toProvider: this.crossChainTrade.trade.itType.to,
        fromHasTrade: !compareAddresses(
          this.crossChainTrade.trade.fromTrade.fromToken.address,
          this.crossChainTrade.trade.fromTrade.toToken.address
        ),
        toHasTrade: !compareAddresses(
          this.crossChainTrade.trade.toTrade.fromToken.address,
          this.crossChainTrade.trade.toTrade.toToken.address
        )
      };
    }
  }

  public async approve(): Promise<void> {
    this.crossChainTrade.trade.approve();
  }

  private parseCalculcationError(error: RubicSdkError): RubicError<ERROR_TYPE> {
    if (error instanceof CrossChainIsUnavailableError) {
      return new CrossChainIsUnavailableWarning();
    }
    if (error instanceof LowSlippageError) {
      return new RubicError('Slippage is too low fro transaction.');
    }
  }

  private checkDeviceAndShowNotification(): void {
    if (this.iframeService.isIframe && this.iframeService.device === 'mobile') {
      this.notificationsService.showOpenMobileWallet();
    }
  }

  private notifyGtmAfterSignTx(txHash: string): void {
    const { fromToken, toToken, fromAmount } = this.swapFormService.inputValue;

    let fee: BigNumber;
    if (this.crossChainTrade.tradeType === CROSS_CHAIN_TRADE_TYPE.SYMBIOSIS) {
      const trade = this.crossChainTrade.trade as SymbiosisCrossChainTrade;
      fee = trade.fee;
    } else {
      // @TODO SDK.
      // const trade = this.crossChainTrade.trade as CelerRubicCrossChainTrade;
      // fee = trade.from.tokenAmount.multipliedBy(trade.transitTokenFee / 100);
      fee = new BigNumber(0);
    }

    this.gtmService.fireTxSignedEvent(
      SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING,
      txHash,
      fromToken.symbol,
      toToken.symbol,
      fee,
      fromAmount.multipliedBy(fromToken.price)
    );
  }
}
