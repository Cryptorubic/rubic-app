import { TradeService } from '@features/swaps/core/services/trade-service/trade.service';
import {
  BlockchainName,
  CelerRubicCrossChainTrade,
  compareAddresses,
  CROSS_CHAIN_TRADE_TYPE,
  CrossChainIsUnavailableError,
  CrossChainTradeType,
  LifiCrossChainTrade,
  LowSlippageError,
  RubicSdkError,
  Web3Pure
} from 'rubic-sdk';
import { RubicCrossChainTradeProvider } from 'rubic-sdk/lib/features/cross-chain/providers/rubic-trade-provider/rubic-cross-chain-trade-provider';
import { CelerCrossChainTradeProvider } from 'rubic-sdk/lib/features/cross-chain/providers/celer-trade-provider/celer-cross-chain-trade-provider';
import { SymbiosisCrossChainTradeProvider } from 'rubic-sdk/lib/features/cross-chain/providers/symbiosis-trade-provider/symbiosis-cross-chain-trade-provider';
import { WrappedCrossChainTrade } from 'rubic-sdk/lib/features/cross-chain/providers/common/models/wrapped-cross-chain-trade';
import { RubicSdkService } from '@features/swaps/core/services/rubic-sdk-service/rubic-sdk.service';
import { SwapFormService } from '@features/swaps/features/main-form/services/swap-form-service/swap-form.service';
import { SettingsService } from '@features/swaps/features/main-form/services/settings-service/settings.service';
import { WalletConnectorService } from '@core/services/blockchain/wallets/wallet-connector-service/wallet-connector.service';
import { Inject, Injectable } from '@angular/core';
import { PriceImpactService } from '@core/services/price-impact/price-impact.service';

import BigNumber from 'bignumber.js';
import {
  CelerRubicTradeInfo,
  SymbiosisTradeInfo
} from '@features/swaps/features/cross-chain-routing/services/cross-chain-routing-service/models/cross-chain-trade-info';
import { SymbiosisCrossChainTrade } from 'rubic-sdk/lib/features/cross-chain/providers/symbiosis-trade-provider/symbiosis-cross-chain-trade';
import { SmartRouting } from '@features/swaps/features/cross-chain-routing/services/cross-chain-routing-service/models/smart-routing.interface';
import CrossChainIsUnavailableWarning from '@core/errors/models/cross-chain-routing/cross-chainIs-unavailable-warning';
import { ERROR_TYPE } from '@core/errors/models/error-type';
import { SwapManagerCrossChainCalculationOptions } from 'rubic-sdk/lib/features/cross-chain/models/swap-manager-cross-chain-options';
import { CrossChainOptions } from 'rubic-sdk/lib/features/cross-chain/models/cross-chain-options';
import { Subscription } from 'rxjs';
import { IframeService } from '@core/services/iframe/iframe.service';
import { SWAP_PROVIDER_TYPE } from '@features/swaps/features/main-form/models/swap-provider-type';
import { RecentTrade } from '@app/shared/models/my-trades/recent-trades.interface';
import { RecentTradesStoreService } from '@app/core/services/recent-trades/recent-trades-store.service';
import { TuiDialogService } from '@taiga-ui/core';
import { SwapSchemeModalComponent } from '../../components/swap-scheme-modal/swap-scheme-modal.component';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { HeaderStore } from '@app/core/header/services/header.store';
import { SwapSchemeModalData } from '../../models/swap-scheme-modal-data.interface';
import { GoogleTagManagerService } from '@core/services/google-tag-manager/google-tag-manager.service';
import { CrossChainRoutingApiService } from '@core/services/backend/cross-chain-routing-api/cross-chain-routing-api.service';
import { shouldCalculateGas } from '@shared/models/blockchain/should-calculate-gas';
import { GasService } from '@core/services/gas-service/gas.service';
import { RubicError } from '@core/errors/models/rubic-error';
import { AuthService } from '@core/services/auth/auth.service';
import { Token } from '@shared/models/tokens/token';

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
    private readonly recentTradesStoreService: RecentTradesStoreService,
    private readonly headerStore: HeaderStore,
    @Inject(TuiDialogService) private readonly dialogService: TuiDialogService,
    private readonly gtmService: GoogleTagManagerService,
    private readonly apiService: CrossChainRoutingApiService,
    private readonly gasService: GasService,
    private readonly authService: AuthService
  ) {
    super('cross-chain-routing');
  }

  public async calculateTrade(
    userAuthorized: boolean
  ): Promise<WrappedCrossChainTrade & { needApprove: boolean }> {
    let needApprove = false;
    try {
      const { fromToken, fromAmount, toToken } = this.swapFormService.inputValue;
      const slippageTolerance = this.settingsService.crossChainRoutingValue.slippageTolerance / 100;
      const options: SwapManagerCrossChainCalculationOptions & CrossChainOptions = {
        fromSlippageTolerance: slippageTolerance / 2,
        toSlippageTolerance: slippageTolerance / 2,
        slippageTolerance,
        timeout: this.defaultTimeout
      };
      const trades = await this.sdk.crossChain.calculateTrade(
        fromToken,
        fromAmount.toString(),
        toToken,
        options
      );
      console.log('TRADES: ', trades);
      console.log('BEST TRADE: ', trades?.[0]);
      this.crossChainTrade = trades[0];
      const { trade, error } = this.crossChainTrade;
      needApprove = userAuthorized && (await trade?.needApprove());
      await this.calculateSmartRouting();
      if (!trade && error instanceof RubicSdkError) {
        throw this.parseCalculationError(this.crossChainTrade.error);
      }
    } catch (err) {
      console.debug(err);
      this.crossChainTrade = null;
      this.smartRouting = null;
      throw err;
    }
    return { ...this.crossChainTrade, needApprove };
  }

  public async createTrade(confirmCallback?: () => void): Promise<void> {
    await this.walletConnectorService.checkSettings(this.crossChainTrade.trade?.from?.blockchain);
    if (!this.crossChainTrade?.trade) {
      throw new RubicError('[RUBIC SDK] Cross chain trade object not found.');
    }
    this.checkDeviceAndShowNotification();

    const form = this.swapFormService.inputValue;

    const onTransactionHash = (txHash: string) => {
      confirmCallback?.();
      const fromToken = compareAddresses(
        this.crossChainTrade?.trade?.from.address,
        form.fromToken.address
      )
        ? form.fromToken
        : (this.crossChainTrade?.trade?.from as unknown as Token); // @TODO change types
      const toToken = compareAddresses(
        this.crossChainTrade?.trade?.to.address,
        form.toToken.address
      )
        ? form.toToken
        : (this.crossChainTrade?.trade?.to as unknown as Token); // @TODO change types
      const tradeData: RecentTrade = {
        srcTxHash: txHash,
        fromBlockchain: this.crossChainTrade?.trade.from?.blockchain,
        toBlockchain: this.crossChainTrade?.trade.to?.blockchain,
        fromToken,
        toToken,
        crossChainProviderType: this.crossChainTrade.tradeType,
        timestamp: Date.now()
      };

      confirmCallback?.();

      if (this.crossChainTrade?.tradeType) {
        this.openSwapSchemeModal(this.crossChainTrade.tradeType, txHash);
      }

      this.recentTradesStoreService.saveTrade(this.authService.userAddress, tradeData);

      this.notifyGtmAfterSignTx(txHash);
    };

    const blockchain = this.crossChainTrade?.trade?.from?.blockchain as BlockchainName;
    const shouldCalculateGasPrice = shouldCalculateGas[blockchain];
    const swapOptions = {
      onConfirm: onTransactionHash,
      ...(Boolean(shouldCalculateGasPrice) && {
        gasPrice: Web3Pure.toWei(await this.gasService.getGasPriceInEthUnits(blockchain))
      })
    };

    await this.crossChainTrade.trade.swap(swapOptions);

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

    if (trade instanceof SymbiosisCrossChainTrade || trade instanceof LifiCrossChainTrade) {
      return {
        estimatedGas,
        feeAmount: trade.fee,
        feeTokenSymbol: trade.feeSymbol,
        feePercent: trade.feePercent,
        priceImpact: String(trade.priceImpact),
        networkFee: trade.networkFee,
        networkFeeSymbol: trade.networkFeeSymbol
      };
    }

    if (trade instanceof CelerRubicCrossChainTrade) {
      const { fromTrade, toTrade, feeInPercents, cryptoFeeToken } =
        trade as CelerRubicCrossChainTrade;
      const fromProvider = fromTrade.provider.type;
      const toProvider = toTrade.provider.type;

      const feeAmount = toTrade.fromToken.tokenAmount.multipliedBy(feeInPercents).dividedBy(100);

      const priceImpactFrom = PriceImpactService.calculatePriceImpact(
        fromTrade.fromToken.price.toNumber(),
        fromTrade.toToken.price.toNumber(),
        fromTrade.fromToken.tokenAmount,
        fromTrade.toToken.tokenAmount
      );

      const priceImpactTo = PriceImpactService.calculatePriceImpact(
        toTrade.fromToken.price.toNumber(),
        toTrade.toToken.price.toNumber(),
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
        feeTokenSymbol: toTrade.fromToken.symbol,
        cryptoFee: cryptoFeeToken.tokenAmount.toNumber(),
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

    if (this.crossChainTrade.trade.type === CROSS_CHAIN_TRADE_TYPE.LIFI) {
      this.smartRouting = null;
    } else if (this.crossChainTrade.trade.type === CROSS_CHAIN_TRADE_TYPE.SYMBIOSIS) {
      this.smartRouting = {
        fromProvider: 'ONE_INCH_BSC',
        toProvider: 'ONE_INCH_ETHEREUM',
        fromHasTrade: true,
        toHasTrade: true
      };
    } else {
      const trade = this.crossChainTrade.trade as CelerRubicCrossChainTrade;
      this.smartRouting = {
        fromProvider: this.crossChainTrade.trade.itType.from,
        toProvider: this.crossChainTrade.trade.itType.to,
        fromHasTrade: !compareAddresses(
          trade.fromTrade.fromToken.address,
          trade.fromTrade.toToken.address
        ),
        toHasTrade: !compareAddresses(
          trade.toTrade.fromToken.address,
          trade.toTrade.toToken.address
        )
      };
    }
  }

  public async approve(): Promise<void> {
    this.checkDeviceAndShowNotification();
    let approveInProgressSubscription$: Subscription;

    const blockchain = this.crossChainTrade?.trade?.from?.blockchain as BlockchainName;
    const shouldCalculateGasPrice = shouldCalculateGas[blockchain];
    const swapOptions = {
      onApprove: () => {
        approveInProgressSubscription$ = this.notificationsService.showApproveInProgress();
      },
      ...(Boolean(shouldCalculateGasPrice) && {
        gasPrice: Web3Pure.toWei(await this.gasService.getGasPriceInEthUnits(blockchain))
      })
    };

    try {
      await this.crossChainTrade.trade.approve(swapOptions);
      this.notificationsService.showApproveSuccessful();
    } finally {
      approveInProgressSubscription$?.unsubscribe();
    }
  }

  private parseCalculationError(error: RubicSdkError): RubicError<ERROR_TYPE> {
    if (error instanceof CrossChainIsUnavailableError) {
      return new CrossChainIsUnavailableWarning();
    }
    if (error instanceof LowSlippageError) {
      return new RubicError('Slippage is too low for transaction.');
    }
    return new RubicError('Unknown SDK error. Try to refresh the page');
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

  public openSwapSchemeModal(provider: CrossChainTradeType, txHash: string): void {
    const { fromBlockchain, toBlockchain, fromToken, toToken } = this.swapFormService.inputValue;

    this.dialogService
      .open<SwapSchemeModalData>(new PolymorpheusComponent(SwapSchemeModalComponent), {
        size: this.headerStore.isMobile ? 'page' : 'l',
        data: {
          fromToken,
          fromBlockchain,
          toToken,
          toBlockchain,
          srcProvider: this.crossChainTrade.trade.itType.from,
          dstProvider: this.crossChainTrade.trade.itType.to,
          crossChainProvider: provider,
          srcTxHash: txHash
        }
      })
      .subscribe();
  }
}
