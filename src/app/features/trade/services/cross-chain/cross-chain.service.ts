import { Inject, Injectable, Injector, INJECTOR } from '@angular/core';
import { map, switchMap, tap } from 'rxjs/operators';
import { firstValueFrom, forkJoin, Observable, timer } from 'rxjs';

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
  NotWhitelistedProviderError,
  PriceToken,
  SwapTransactionOptions,
  TO_BACKEND_BLOCKCHAINS,
  Token,
  UnapprovedContractError,
  UnapprovedMethodError,
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
import { TradeParser } from '@features/trade/utils/trade-parser';
import { SessionStorageService } from '@core/services/session-storage/session-storage.service';
import { AirdropPointsService } from '@app/shared/services/airdrop-points-service/airdrop-points.service';
import { CALCULATION_TIMEOUT_MS } from '../../constants/calculation';
import { FormsTogglerService } from '../forms-toggler/forms-toggler.service';
import { handleIntegratorAddress } from '../../utils/handle-integrator-address';
import { CCR_LONG_TIMEOUT_CHAINS } from './ccr-long-timeout-chains';

@Injectable()
export class CrossChainService {
  private readonly defaultTimeout = CALCULATION_TIMEOUT_MS;

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
    private readonly airdropPointsService: AirdropPointsService,
    private readonly formsTogglerService: FormsTogglerService
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
          price: fromPrice
        });
        const toSdkCompatibleToken = new PriceToken({
          ...toToken,
          price: toPrice
        });
        const options = this.getOptions(disabledTradeTypes);
        handleIntegratorAddress(options, fromBlockchain, toBlockchain);

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
    disabledTradeTypes: CrossChainTradeType[]
  ): CrossChainManagerCalculationOptions {
    const slippageTolerance = this.settingsService.crossChainRoutingValue.slippageTolerance / 100;
    const receiverAddress = this.receiverAddress;

    const { disabledCrossChainTradeTypes: apiDisabledTradeTypes, disabledSubProviders } =
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
    const calculateGas = this.authService.userAddress;
    const timeout = this.calculateTimeoutForChains();

    return {
      fromSlippageTolerance: slippageTolerance / 2,
      toSlippageTolerance: slippageTolerance / 2,
      slippageTolerance,
      timeout,
      disabledProviders: disabledProviders,
      lifiDisabledBridgeTypes: [
        ...(disabledSubProviders[CROSS_CHAIN_TRADE_TYPE.LIFI] || []),
        ...(queryLifiDisabledBridges || [])
      ],
      rangoDisabledProviders: [
        ...(disabledSubProviders[CROSS_CHAIN_TRADE_TYPE.RANGO] || []),
        ...(queryRangoDisabledBridges || [])
      ],
      ...(receiverAddress && { receiverAddress }),
      changenowFullyEnabled: true,
      gasCalculation: calculateGas ? 'enabled' : 'disabled',
      useProxy: {
        ...this.platformConfigurationService.useCrossChainChainProxy
      }
    };
  }

  private getDisabledProxyConfig(): Record<CrossChainTradeType, boolean> {
    return Object.fromEntries(
      Object.values(CROSS_CHAIN_TRADE_TYPE).map(tradeType => [tradeType, false])
    ) as Record<CrossChainTradeType, boolean>;
  }

  private saveNotWhitelistedProvider(
    error: NotWhitelistedProviderError | UnapprovedContractError | UnapprovedMethodError,
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
   * @param useCacheData Use cached data or not
   * @returns transactionHash - on successfull swap
   */
  public async swapTrade(
    trade: CrossChainTrade<unknown>,
    callbackOnHash?: (hash: string) => void,
    useCacheData?: boolean
  ): Promise<string | null> {
    if (!this.isSlippageCorrect(trade)) {
      return null;
    }

    const useMevBotProtection = this.settingsService.crossChainRoutingValue.useMevBotProtection;
    this.checkBlockchainsAvailable(trade);

    const [fromToken, toToken] = await Promise.all([
      this.tokensService.findToken(trade.from),
      this.tokensService.findToken(trade.to)
    ]);
    await this.handlePreSwapModal(trade);

    let transactionHash: string;
    const onTransactionHash = (txHash: string) => {
      transactionHash = txHash;
      callbackOnHash?.(txHash);
      this.crossChainApiService.createTrade(txHash, trade);

      this.notifyGtmAfterSignTx(
        txHash,
        fromToken,
        toToken,
        trade.from.tokenAmount,
        useMevBotProtection
      );
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
      ...(referrer && { referrer }),
      useCacheData: useCacheData || false
    };

    try {
      await trade.swap(swapOptions);
      await this.conditionalAwait(fromToken.blockchain);
      await this.tokensService.updateTokenBalanceAfterCcrSwap(fromToken, toToken);
      return transactionHash;
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
        error instanceof UnapprovedContractError ||
        error instanceof UnapprovedMethodError
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
    trade: CrossChainTrade<unknown>,
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
    fromAmount: BigNumber,
    useMevBotProtection: boolean
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
      'crosschain',
      fromAmount.multipliedBy(fromToken.price).gt(1000) ? useMevBotProtection : null
    );
  }

  private async conditionalAwait(blockchain: BlockchainName): Promise<void> {
    if (blockchain === BLOCKCHAIN_NAME.SOLANA) {
      const waitTime = 3_000;
      await firstValueFrom(timer(waitTime));
    }
  }

  private calculateTimeoutForChains(): number {
    const { fromBlockchain, toBlockchain } = this.swapFormService.inputValue;
    if (
      CCR_LONG_TIMEOUT_CHAINS.includes(fromBlockchain) ||
      CCR_LONG_TIMEOUT_CHAINS.includes(toBlockchain)
    ) {
      return 30_000;
    }
    return this.defaultTimeout;
  }
}
