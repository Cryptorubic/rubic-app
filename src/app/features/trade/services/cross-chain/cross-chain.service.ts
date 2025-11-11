import { Inject, Injectable, Injector, INJECTOR } from '@angular/core';
import { firstValueFrom, timer } from 'rxjs';

import { SdkService } from '@core/services/sdk/sdk.service';
import { SwapsFormService } from '@features/trade/services/swaps-form/swaps-form.service';
import {
  EvmBasicTransactionOptions,
  NotWhitelistedProviderError,
  PriceToken,
  SwapTransactionOptions,
  UnapprovedContractError,
  UnapprovedMethodError,
  UnnecessaryApproveError,
  UserRejectError,
  Web3Pure,
  Injector as SdkInjector,
  EvmCrossChainTrade,
  CrossChainTrade
} from '@cryptorubic/sdk';
import { PlatformConfigurationService } from '@core/services/backend/platform-configuration/platform-configuration.service';
import { QueryParamsService } from '@core/services/query-params/query-params.service';
import { TokensService } from '@core/services/tokens/tokens.service';
import BigNumber from 'bignumber.js';
import { CrossChainApiService } from '@features/trade/services/cross-chain-routing-api/cross-chain-api.service';

import { SettingsService } from '@features/trade/services/settings-service/settings.service';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
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
import { CALCULATION_TIMEOUT_MS } from '../../constants/calculation';
import { CCR_LONG_TIMEOUT_CHAINS } from './ccr-long-timeout-chains';
import { ProxyFeeService } from '@features/trade/services/proxy-fee-service/proxy-fee.service';
import { IframeService } from '@app/core/services/iframe-service/iframe.service';
import { notEvmChangeNowBlockchainsList } from '../../components/assets-selector/services/blockchains-list-service/constants/blockchains-list';
import { RefundService } from '../refund-service/refund.service';
import {
  BLOCKCHAIN_NAME,
  BlockchainName,
  CROSS_CHAIN_TRADE_TYPE,
  CrossChainTradeType,
  ErrorInterface,
  QuoteOptionsInterface,
  TO_BACKEND_BLOCKCHAINS
} from '@cryptorubic/core';
import { LowSlippageError } from '@app/core/errors/models/common/low-slippage-error';
import { SimulationFailedError } from '@app/core/errors/models/common/simulation-failed.error';
import { NotificationsService } from '@core/services/notifications/notifications.service';
import { SOLANA_SPONSOR } from '@features/trade/constants/solana-sponsor';
import { SolanaGaslessService } from '../solana-gasless/solana-gasless.service';
import { checkAmountGte100Usd } from '../solana-gasless/utils/solana-utils';

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
    private readonly proxyService: ProxyFeeService,
    private readonly iframeService: IframeService,
    private readonly refundService: RefundService,
    private readonly notificationsService: NotificationsService,
    private readonly solanaGaslessService: SolanaGaslessService
  ) {}

  public async calculateTrades(disabledTradeTypes: CrossChainTradeType[]): Promise<void> {
    const { fromToken, toToken, fromAmount, fromBlockchain, toBlockchain } =
      this.swapFormService.inputValue;
    const [fromPrice, toPrice] = await Promise.all([
      this.tokensService.getTokenPrice(fromToken, true),
      this.tokensService.getTokenPrice(toToken, true)
    ]);
    const fromSdkCompatibleToken = new PriceToken({
      ...fromToken,
      price: fromPrice
    });
    const toSdkCompatibleToken = new PriceToken({
      ...toToken,
      price: toPrice
    });

    const disabledProviders = this.getDisabledProviders(
      disabledTradeTypes,
      fromBlockchain,
      toBlockchain
    );
    const options = await this.getOptions(
      disabledProviders,
      fromSdkCompatibleToken,
      toSdkCompatibleToken,
      fromAmount.actualValue
    );

    const tradeParams = {
      srcTokenAddress: fromToken.address,
      dstTokenBlockchain: toToken.blockchain,
      srcTokenBlockchain: fromToken.blockchain,
      srcTokenAmount: fromAmount.actualValue.toFixed(),
      dstTokenAddress: toToken.address
    };

    SdkInjector.rubicApiService.calculateAsync({
      calculationTimeout: 60,
      showDangerousRoutes: true,
      ...tradeParams,
      ...options
    });
  }

  private async getOptions(
    disabledTradeTypes: CrossChainTradeType[],
    fromSdkToken: PriceToken,
    toSdkToken: PriceToken,
    fromAmount: BigNumber
  ): Promise<QuoteOptionsInterface> {
    const slippageTolerance = this.settingsService.crossChainRoutingValue.slippageTolerance / 100;
    const { disabledCrossChainTradeTypes: apiDisabledTradeTypes } =
      this.platformConfigurationService.disabledCcrProviders;

    const queryDisabledTradeTypes = this.queryParamsService.disabledCrossChainProviders;
    const disabledProvidersFromApiAndQuery = Array.from(
      new Set<CrossChainTradeType>([
        ...disabledTradeTypes,
        ...(apiDisabledTradeTypes || []),
        ...(queryDisabledTradeTypes || [])
      ])
    );
    const preferredProvider = this.queryParamsService.preferredCrossChainProvider;

    const providerAddress = await this.proxyService.getIntegratorAddress(
      fromSdkToken,
      fromAmount,
      toSdkToken
    );
    const options: QuoteOptionsInterface = {
      slippage: slippageTolerance,
      nativeBlacklist: disabledProvidersFromApiAndQuery,
      integratorAddress: providerAddress,
      preferredProvider: preferredProvider
    };

    return options;
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
    params: { useCacheData: boolean; skipAmountCheck: boolean } = {
      useCacheData: false,
      skipAmountCheck: false
    }
  ): Promise<string | null> {
    const useMevBotProtection = this.settingsService.crossChainRoutingValue.useMevBotProtection;
    this.checkBlockchainsAvailable(trade);

    const [fromToken, toToken] = await Promise.all([
      this.tokensService.findToken(trade.from),
      this.tokensService.findToken(trade.to)
    ]);
    await this.handlePreSwapModal(trade);

    const preTradeId = await this.sendPreTradeInfo(trade);

    let transactionHash: string;
    const onTransactionHash = (txHash: string) => {
      transactionHash = txHash;
      callbackOnHash?.(txHash);
      this.crossChainApiService.createTrade(txHash, trade, preTradeId);

      this.notifyGtmAfterSignTx(
        txHash,
        fromToken,
        toToken,
        trade.from.tokenAmount,
        useMevBotProtection
      );
    };

    const onWarning = (warnings: ErrorInterface[]) => {
      warnings.forEach(warning => {
        // Check for 50XX domain of errors - sponsorship errors
        if (warning.code.toString().startsWith('50')) {
          this.notificationsService.showSwapWarning(warning);
        }
      });
    };

    const blockchain = trade.from.blockchain;

    const { shouldCalculateGasPrice, gasPriceOptions } = await this.gasService.getGasInfo(
      blockchain
    );

    const referrer = this.sessionStorage.getItem('referral');

    const receiverAddress = this.receiverAddress;
    const swapOptions: SwapTransactionOptions = {
      onConfirm: onTransactionHash,
      onWarning,
      ...(receiverAddress && { receiverAddress }),
      ...(shouldCalculateGasPrice && { gasPriceOptions }),
      ...(this.queryParamsService.testMode && { testMode: true }),
      ...(referrer && { referrer }),
      refundAddress: this.refundService.refundAddress,
      useCacheData: params.useCacheData,
      skipAmountCheck: params.skipAmountCheck,
      solanaSponsorParams: {
        feePayer: SOLANA_SPONSOR,
        tradeId: trade.rubicId
      }
    };

    try {
      await trade.swap(swapOptions);
      await this.conditionalAwait(fromToken.blockchain);
      await this.tokensService.updateTokenBalanceAfterCcrSwap(fromToken, toToken);

      if (trade.from.blockchain === BLOCKCHAIN_NAME.SOLANA && checkAmountGte100Usd(trade)) {
        this.solanaGaslessService.updateGaslessTxCount24Hrs(this.walletConnectorService.address);
      }

      return transactionHash;
    } catch (error) {
      if (
        error instanceof NotWhitelistedProviderError ||
        error instanceof UnapprovedContractError ||
        error instanceof UnapprovedMethodError
      ) {
        this.saveNotWhitelistedProvider(error, trade.from.blockchain, trade.type);
      }

      const parsedError = RubicSdkErrorParser.parseError(error);
      if (!(error instanceof UserRejectError)) {
        this.gtmService.fireSwapError(trade, this.authService.userAddress, parsedError);
      }

      if (parsedError instanceof SimulationFailedError && trade.getTradeInfo().slippage < 5) {
        const slippageErr = new LowSlippageError();
        throw slippageErr;
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

  private getDisabledProviders(
    disabledTradesTypes: CrossChainTradeType[],
    fromBlockchain: BlockchainName,
    toBlockchain: BlockchainName
  ): CrossChainTradeType[] {
    const isNonEvmCNChain = (
      Object.values(notEvmChangeNowBlockchainsList) as BlockchainName[]
    ).includes(fromBlockchain);

    let disabledProviders = [...disabledTradesTypes];

    if (isNonEvmCNChain && this.iframeService.isIframe) {
      disabledProviders = [...disabledProviders, CROSS_CHAIN_TRADE_TYPE.CHANGENOW];
    }

    const referral = this.sessionStorage.getItem('referral');

    // @TODO remove after birthday promo
    if (fromBlockchain === BLOCKCHAIN_NAME.SOLANA || toBlockchain === BLOCKCHAIN_NAME.SOLANA) {
      disabledProviders = [
        ...disabledProviders
        // CROSS_CHAIN_TRADE_TYPE.CHANGELLY,
        // CROSS_CHAIN_TRADE_TYPE.SIMPLE_SWAP,
        // CROSS_CHAIN_TRADE_TYPE.EXOLIX,
        // CROSS_CHAIN_TRADE_TYPE.CHANGENOW
      ];
    }

    if (referral) {
      const integratorAddress = this.sessionStorage.getItem(referral.toLowerCase());

      if (integratorAddress) {
        disabledProviders = [
          ...disabledProviders,
          CROSS_CHAIN_TRADE_TYPE.SIMPLE_SWAP,
          CROSS_CHAIN_TRADE_TYPE.CHANGELLY
        ];
      }
    }

    return disabledProviders;
  }

  private async sendPreTradeInfo(trade: CrossChainTrade): Promise<string | null> {
    try {
      const preTradeId = await this.crossChainApiService.sendPreTradeInfo(trade);
      return preTradeId;
    } catch {
      return null;
    }
  }
}
