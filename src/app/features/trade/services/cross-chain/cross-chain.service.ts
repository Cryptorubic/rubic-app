import { Inject, Injectable, Injector, INJECTOR } from '@angular/core';
import { map, switchMap, tap } from 'rxjs/operators';
import { firstValueFrom, forkJoin, Observable } from 'rxjs';

import { SdkService } from '@core/services/sdk/sdk.service';
import { SwapsFormService } from '@features/trade/services/swaps-form/swaps-form.service';
import { TradeContainer } from '@features/trade/models/trade-container';
import {
  BLOCKCHAIN_NAME,
  BlockchainName,
  ChangenowCrossChainTrade,
  ChangenowPaymentInfo,
  CROSS_CHAIN_TRADE_TYPE,
  CrossChainManagerCalculationOptions,
  CrossChainTradeType,
  EvmBasicTransactionOptions,
  EvmCrossChainTrade,
  EvmEncodeConfig,
  NotWhitelistedProviderError,
  PriceToken,
  SwapTransactionOptions,
  Token,
  UnapprovedContractError,
  UnnecessaryApproveError,
  UserRejectError,
  Web3Pure
} from 'rubic-sdk';
import { PlatformConfigurationService } from '@core/services/backend/platform-configuration/platform-configuration.service';
import { QueryParamsService } from '@core/services/query-params/query-params.service';
import { TokensService } from '@core/services/tokens/tokens.service';
import BigNumber from 'bignumber.js';
import { CrossChainApiService } from '@features/trade/services/cross-chain-routing-api/cross-chain-api.service';

import { CrossChainTrade } from 'rubic-sdk/lib/features/cross-chain/calculation-manager/providers/common/cross-chain-trade';
import { SettingsService } from '@features/trade/services/settings-service/settings.service';
import { TO_BACKEND_BLOCKCHAINS } from '@shared/constants/blockchain/backend-blockchains';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import { AutoSlippageWarningModalComponent } from '@shared/components/via-slippage-warning-modal/auto-slippage-warning-modal.component';
import { ModalService } from '@core/modals/services/modal.service';
import { AuthService } from '@core/services/auth/auth.service';
import BlockchainIsUnavailableWarning from '@core/errors/models/common/blockchain-is-unavailable.warning';
import { blockchainLabel } from '@shared/constants/blockchain/blockchain-label';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import { GoogleTagManagerService } from '@core/services/google-tag-manager/google-tag-manager.service';
import { GasService } from '@core/services/gas-service/gas.service';
import { RubicSdkErrorParser } from '@core/errors/models/rubic-sdk-error-parser';
import { TargetNetworkAddressService } from '@features/trade/services/target-network-address-service/target-network-address.service';
import { CrossChainCalculatedTradeData } from '@features/trade/models/cross-chain-calculated-trade';
import { SWAP_PROVIDER_TYPE } from '@features/trade/models/swap-provider-type';
import { shouldCalculateGas } from '@features/trade/constants/should-calculate-gas';
import { TradeParser } from '@features/trade/utils/trade-parser';
import { SessionStorageService } from '@core/services/session-storage/session-storage.service';
import { AirdropPointsService } from '@app/shared/services/airdrop-points-service/airdrop-points.service';

@Injectable()
export class CrossChainService {
  private readonly defaultTimeout = 15_000;

  private get receiverAddress(): string | null {
    if (!this.settingsService.crossChainRoutingValue.showReceiverAddress) {
      return null;
    }
    return this.targetNetworkAddressService.address;
  }

  constructor(
    private readonly sdkService: SdkService,
    private readonly swapFormService: SwapsFormService,
    private readonly settingsService: SettingsService,
    private readonly targetNetworkAddressService: TargetNetworkAddressService,
    private readonly platformConfigurationService: PlatformConfigurationService,
    private readonly queryParamsService: QueryParamsService,
    private readonly sessionStorage: SessionStorageService,
    private readonly tokensService: TokensService,
    private readonly crossChainApiService: CrossChainApiService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly dialogService: ModalService,
    @Inject(INJECTOR) private readonly injector: Injector,
    private readonly authService: AuthService,
    private readonly gtmService: GoogleTagManagerService,
    private readonly gasService: GasService,
    private readonly airdropPointsService: AirdropPointsService
  ) {}

  public calculateTrades(disabledTradeTypes: CrossChainTradeType[]): Observable<TradeContainer> {
    let providers: CrossChainCalculatedTradeData[] = [];
    const { fromToken, toToken, fromAmount, fromBlockchain, toBlockchain } =
      this.swapFormService.inputValue;
    return forkJoin([
      this.sdkService.deflationTokenManager.isDeflationToken(new Token(fromToken)),
      this.tokensService.getAndUpdateTokenPrice(fromToken, true),
      this.tokensService.getAndUpdateTokenPrice(toToken, true)
    ]).pipe(
      switchMap(([tokenState, fromPrice, toPrice]) => {
        const fromSdkCompatibleToken = new PriceToken({
          ...fromToken,
          price: new BigNumber(fromPrice as number | null)
        });
        const toSdkCompatibleToken = new PriceToken({
          ...toToken,
          price: new BigNumber(toPrice as number | null)
        });
        const options = this.getOptions(disabledTradeTypes, fromBlockchain);

        const calculationStartTime = Date.now();

        return this.sdkService.crossChain
          .calculateTradesReactively(
            fromSdkCompatibleToken,
            fromAmount.actualValue.toFixed(),
            toSdkCompatibleToken,
            tokenState.isDeflation
              ? { ...options, useProxy: this.getDisabledProxyConfig() }
              : options
          )
          .pipe(
            map(el => ({
              ...el,
              calculationTime: Date.now() - calculationStartTime
            })),
            map(el => ({ value: el, type: SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING })),
            tap(el => {
              if (el?.value?.wrappedTrade?.error instanceof NotWhitelistedProviderError) {
                this.saveNotWhitelistedProvider(
                  el.value.wrappedTrade.error,
                  fromToken.blockchain,
                  el.value.wrappedTrade.tradeType
                );
              }
            }),
            tap(el => {
              const tradeContainer = el?.value;
              providers = tradeContainer.calculated === 0 ? [] : [...providers, tradeContainer];
              if (
                tradeContainer.calculated === tradeContainer.total &&
                tradeContainer?.calculated !== 0
              ) {
                this.saveTrade(providers, {
                  fromAmount: Web3Pure.toWei(fromAmount.actualValue, fromToken.decimals),
                  fromBlockchain,
                  toBlockchain,
                  fromAddress: fromToken.address,
                  toAddress: toToken.address
                });
              }
            })
          );
      })
    );
  }

  private getOptions(
    disabledTradeTypes: CrossChainTradeType[],
    fromBlockchain: BlockchainName
  ): CrossChainManagerCalculationOptions {
    const slippageTolerance = this.settingsService.crossChainRoutingValue.slippageTolerance / 100;
    const receiverAddress = this.receiverAddress;

    const { disabledCrossChainTradeTypes: apiDisabledTradeTypes, disabledBridgeTypes } =
      this.platformConfigurationService.disabledProviders;
    const queryLifiDisabledBridges = this.queryParamsService.disabledLifiBridges;
    const queryRangoDisabledBridges = this.queryParamsService.disabledRangoBridges;

    const queryDisabledTradeTypes = this.queryParamsService.disabledCrossChainProviders;
    const disabledProviders = Array.from(
      new Set<CrossChainTradeType>([
        ...disabledTradeTypes,
        ...(apiDisabledTradeTypes || []),
        ...(queryDisabledTradeTypes || [])
      ])
    );
    const calculateGas = shouldCalculateGas[fromBlockchain] && this.authService.userAddress;

    return {
      fromSlippageTolerance: slippageTolerance / 2,
      toSlippageTolerance: slippageTolerance / 2,
      slippageTolerance,
      timeout: this.defaultTimeout,
      disabledProviders: disabledProviders,
      lifiDisabledBridgeTypes: [
        ...(disabledBridgeTypes?.[CROSS_CHAIN_TRADE_TYPE.LIFI] || []),
        ...(queryLifiDisabledBridges || [])
      ],
      rangoDisabledProviders: [
        ...(disabledBridgeTypes?.[CROSS_CHAIN_TRADE_TYPE.RANGO] || []),
        ...(queryRangoDisabledBridges || [])
      ],
      ...(receiverAddress && { receiverAddress }),
      changenowFullyEnabled: true,
      gasCalculation: calculateGas ? 'enabled' : 'disabled',
      useProxy: this.platformConfigurationService.useCrossChainChainProxy
    };
  }

  private getDisabledProxyConfig(): Record<CrossChainTradeType, boolean> {
    return Object.fromEntries(
      Object.values(CROSS_CHAIN_TRADE_TYPE).map(tradeType => [tradeType, false])
    ) as Record<CrossChainTradeType, boolean>;
  }

  private saveNotWhitelistedProvider(
    error: NotWhitelistedProviderError | UnapprovedContractError,
    blockchain: BlockchainName,
    tradeType: CrossChainTradeType
  ): void {
    if (error instanceof NotWhitelistedProviderError) {
      this.crossChainApiService
        .saveNotWhitelistedProvider(error, blockchain, tradeType)
        .subscribe();
    } else {
      this.crossChainApiService
        .saveNotWhitelistedCcrProvider(error, blockchain, tradeType)
        .subscribe();
    }
  }

  public async getChangenowPaymentInfo(
    trade: ChangenowCrossChainTrade
  ): Promise<{ paymentInfo: ChangenowPaymentInfo; receiverAddress: string }> {
    const receiverAddress = this.receiverAddress;
    const paymentInfo = await trade.getChangenowPostTrade(receiverAddress);
    return {
      paymentInfo,
      receiverAddress
    };
  }

  /**
   *
   * @param trade trade data
   * @param callbackOnHash function call with hash-string and 'sourcePending'-status
   * @param directTransaction Transaction config to execute forced
   * @returns 'success' - on successfull swap, 'reject' - on any error
   */

  public async swapTrade(
    trade: CrossChainTrade,
    callbackOnHash?: (hash: string) => void,
    directTransaction?: EvmEncodeConfig
  ): Promise<'success' | 'reject'> {
    if (!this.isSlippageCorrect(trade)) {
      return 'reject';
    }

    const isSwapAndEarnSwapTrade = this.isSwapAndEarnSwap(trade);
    this.checkBlockchainsAvailable(trade);

    this.airdropPointsService.setSeNPointsTemp('cross-chain').subscribe();

    const [fromToken, toToken] = await Promise.all([
      this.tokensService.findToken(trade.from),
      this.tokensService.findToken(trade.to)
    ]);
    await this.handlePreSwapModal(trade);

    let transactionHash: string;

    const onTransactionHash = (txHash: string) => {
      transactionHash = txHash;
      callbackOnHash?.(txHash);
      this.crossChainApiService.createTrade(txHash, trade, isSwapAndEarnSwapTrade);

      this.notifyGtmAfterSignTx(txHash, fromToken, toToken, trade.from.tokenAmount);
    };

    const blockchain = trade.from.blockchain;

    const { shouldCalculateGasPrice, gasPriceOptions } = await this.gasService.getGasInfo(
      blockchain
    );

    const referrer = this.sessionStorage.getItem('referral');

    const receiverAddress = this.receiverAddress;
    const swapOptions: SwapTransactionOptions = {
      onConfirm: onTransactionHash,
      ...(receiverAddress && { receiverAddress }),
      ...(shouldCalculateGasPrice && { gasPriceOptions }),
      ...(this.queryParamsService.testMode && { testMode: true }),
      ...(directTransaction && { directTransaction }),
      ...(referrer && { referrer })
    };

    try {
      await trade.swap(swapOptions);
      await this.tokensService.updateTokenBalanceAfterCcrSwap(fromToken, toToken);
      await this.crossChainApiService.patchTrade(transactionHash, true);
      return 'success';
    } catch (error) {
      if (
        transactionHash &&
        error instanceof Error &&
        error.message.includes('Transaction was not mined')
      ) {
        await this.crossChainApiService.patchTrade(transactionHash, false);
      }

      if (
        error instanceof NotWhitelistedProviderError ||
        error instanceof UnapprovedContractError
      ) {
        this.saveNotWhitelistedProvider(error, trade.from.blockchain, trade.type);
      }

      // this.handleSwapError(error, currentSelectedTrade.tradeType);
      const parsedError = RubicSdkErrorParser.parseError(error);

      if (!(parsedError instanceof UserRejectError)) {
        this.gtmService.fireTransactionError(trade.from.name, trade.to.name, error.code);
      }

      throw parsedError;
    }
  }

  public async approveTrade(
    trade: CrossChainTrade,
    _callback?: (hash: string) => void
  ): Promise<void> {
    this.checkBlockchainsAvailable(trade);

    const blockchain = trade.from.blockchain;

    const { shouldCalculateGasPrice, gasPriceOptions } = await this.gasService.getGasInfo(
      blockchain
    );

    let swapOptions: EvmBasicTransactionOptions = {};

    try {
      if (trade instanceof EvmCrossChainTrade) {
        swapOptions = { ...swapOptions, ...(shouldCalculateGasPrice && { gasPriceOptions }) };
      }
      const { fromAmount, fromDecimals } = TradeParser.getCrossChainSwapParams(trade);
      const amount = new BigNumber(Web3Pure.toWei(fromAmount, fromDecimals));
      await trade.approve(swapOptions, true, amount);
    } catch (err) {
      if (err instanceof UnnecessaryApproveError) {
        return;
      }
      throw err;
    }
  }

  private saveTrade(
    providers: CrossChainCalculatedTradeData[],
    trade: {
      fromAddress: string;
      fromBlockchain: BlockchainName;
      toAddress: string;
      toBlockchain: BlockchainName;
      fromAmount: string;
    }
  ): void {
    this.crossChainApiService
      .saveProvidersStatistics({
        user: this.walletConnectorService.address,
        from_token: trade.fromAddress,
        from_network: TO_BACKEND_BLOCKCHAINS?.[trade.fromBlockchain],
        from_amount: trade.fromAmount,
        to_token: trade.toAddress,
        to_network: TO_BACKEND_BLOCKCHAINS?.[trade.toBlockchain],
        providers_statistics: providers.map(providerTrade => {
          const { calculationTime, wrappedTrade } = providerTrade;
          return {
            provider_title: wrappedTrade?.tradeType,
            calculation_time_in_seconds: String(calculationTime / 1000),
            to_amount: wrappedTrade?.trade?.to.stringWeiAmount,
            status: wrappedTrade?.trade ? 'success' : 'error',
            has_swap_in_source_network: wrappedTrade?.trade && 'onChainTrade' in wrappedTrade.trade,
            proxy_used: wrappedTrade?.trade?.feeInfo?.rubicProxy?.fixedFee?.amount?.gt(0),
            ...(wrappedTrade?.error && {
              additional_info: wrappedTrade.error.message
            })
          };
        })
      })
      .subscribe();
  }

  private isSlippageCorrect(trade: CrossChainTrade): boolean {
    if (
      this.settingsService.crossChainRoutingValue.autoSlippageTolerance ||
      [CROSS_CHAIN_TRADE_TYPE.BRIDGERS].every(crossChainType => crossChainType !== trade.type)
    ) {
      return true;
    }

    this.dialogService
      .showDialog(
        AutoSlippageWarningModalComponent,
        {
          size: 's',
          fitContent: true
        },
        this.injector
      )
      .subscribe();
    return false;
  }

  private isSwapAndEarnSwap(trade: CrossChainTrade): boolean {
    const swapWithProxy = trade.feeInfo?.rubicProxy?.fixedFee?.amount.gt(0);

    return (trade.type === CROSS_CHAIN_TRADE_TYPE.CHANGENOW && swapWithProxy) || swapWithProxy;
  }

  private checkBlockchainsAvailable(trade: CrossChainTrade): void | never {
    const fromBlockchain = trade.from.blockchain;
    const toBlockchain = trade.to.blockchain;
    if (!this.platformConfigurationService.isAvailableBlockchain(fromBlockchain)) {
      throw new BlockchainIsUnavailableWarning(blockchainLabel[fromBlockchain]);
    }
    if (!this.platformConfigurationService.isAvailableBlockchain(toBlockchain)) {
      throw new BlockchainIsUnavailableWarning(blockchainLabel[toBlockchain]);
    }
  }

  private async handlePreSwapModal(trade: CrossChainTrade): Promise<void> {
    if (
      trade.type === CROSS_CHAIN_TRADE_TYPE.ARBITRUM &&
      trade.from.blockchain === BLOCKCHAIN_NAME.ARBITRUM
    ) {
      try {
        await firstValueFrom(this.dialogService.openArbitrumWarningModal());
      } catch {
        throw new UserRejectError();
      }
    }
  }

  private notifyGtmAfterSignTx(
    txHash: string,
    fromToken: TokenAmount,
    toToken: TokenAmount,
    fromAmount: BigNumber
  ): void {
    // @TODO remove hardcode
    const fee = new BigNumber(2);

    this.gtmService.fireTxSignedEvent(
      SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING,
      txHash,
      fromToken.symbol,
      toToken.symbol,
      fee,
      fromAmount.multipliedBy(fromToken.price),
      'crosschain'
    );
  }
}
