import { Injectable } from '@angular/core';
import { concatMap, firstValueFrom, of, timer } from 'rxjs';

import { catchError, first, switchMap } from 'rxjs/operators';
import { SdkService } from '@core/services/sdk/sdk.service';
import { SwapsFormService } from '@features/trade/services/swaps-form/swaps-form.service';
import {
  BLOCKCHAIN_NAME,
  BlockchainName,
  NotWhitelistedProviderError,
  OnChainTrade,
  OnChainTradeType,
  PriceToken,
  SwapTransactionOptions,
  TX_STATUS,
  UnnecessaryApproveError,
  UserRejectError,
  Web3Pure,
  UnapprovedContractError,
  UnapprovedMethodError,
  TO_BACKEND_BLOCKCHAINS,
  TonOnChainTrade,
  ON_CHAIN_TRADE_TYPE
} from 'rubic-sdk';
import BlockchainIsUnavailableWarning from '@core/errors/models/common/blockchain-is-unavailable.warning';
import { blockchainLabel } from '@shared/constants/blockchain/blockchain-label';
import { PlatformConfigurationService } from '@core/services/backend/platform-configuration/platform-configuration.service';
import { GasService } from '@core/services/gas-service/gas.service';
import { TokensService } from '@core/services/tokens/tokens.service';
import { AuthService } from '@core/services/auth/auth.service';
import BigNumber from 'bignumber.js';
import { SettingsService } from '@features/trade/services/settings-service/settings.service';
import { TargetNetworkAddressService } from '@features/trade/services/target-network-address-service/target-network-address.service';
import { GoogleTagManagerService } from '@core/services/google-tag-manager/google-tag-manager.service';
import { QueryParamsService } from '@core/services/query-params/query-params.service';
import { TransactionFailedError } from '@core/errors/models/common/transaction-failed-error';
import { OnChainApiService } from '@features/trade/services/on-chain-api/on-chain-api.service';
import { SWAP_PROVIDER_TYPE } from '@features/trade/models/swap-provider-type';
import { TradeParser } from '@features/trade/utils/trade-parser';
import { SessionStorageService } from '@core/services/session-storage/session-storage.service';
import { ON_CHAIN_LONG_TIMEOUT_CHAINS } from './constants/long-timeout-chains';
import { ProxyFeeService } from '@features/trade/services/proxy-fee-service/proxy-fee.service';
import { OnChainCalculatedTradeData } from '../../models/on-chain-calculated-trade';
import { WalletConnectorService } from '@app/core/services/wallets/wallet-connector-service/wallet-connector.service';
import { ModalService } from '@app/core/modals/services/modal.service';
import { QuoteOptionsInterface } from '@cryptorubic/core';
import { Injector as SdkInjector } from 'rubic-sdk/lib/core/injector/injector';

type NotWhitelistedProviderErrors =
  | UnapprovedContractError
  | UnapprovedMethodError
  | NotWhitelistedProviderError;
@Injectable()
export class OnChainService {
  private get receiverAddress(): string | null {
    if (!this.settingsService.instantTradeValue.showReceiverAddress) {
      return null;
    }
    return this.targetNetworkAddressService.address;
  }

  constructor(
    private readonly sdkService: SdkService,
    private readonly swapFormService: SwapsFormService,
    private readonly platformConfigurationService: PlatformConfigurationService,
    private readonly gasService: GasService,
    private readonly tokensService: TokensService,
    private readonly authService: AuthService,
    private readonly settingsService: SettingsService,
    private readonly targetNetworkAddressService: TargetNetworkAddressService,
    private readonly gtmService: GoogleTagManagerService,
    private readonly onChainApiService: OnChainApiService,
    private readonly queryParamsService: QueryParamsService,
    private readonly sessionStorage: SessionStorageService,
    private readonly proxyService: ProxyFeeService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly modalService: ModalService
  ) {}

  public async calculateTrades(disabledProviders: OnChainTradeType[]): Promise<void> {
    const { fromToken, toToken, fromAmount } = this.swapFormService.inputValue;
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

    const options = await this.getOptions(
      fromSdkCompatibleToken,
      toSdkCompatibleToken,
      disabledProviders,
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

  /**
   * @returns transactionHash on successful swap
   */
  public async swapTrade(
    trade: OnChainTrade,
    callback?: (hash: string) => void,
    params: { useCacheData: boolean; skipAmountCheck: boolean } = {
      useCacheData: false,
      skipAmountCheck: false
    }
  ): Promise<string> {
    const fromBlockchain = trade.from.blockchain;

    const { fromSymbol, toSymbol, fromAmount, fromPrice, blockchain } =
      TradeParser.getItSwapParams(trade);

    if (!this.platformConfigurationService.isAvailableBlockchain(fromBlockchain)) {
      throw new BlockchainIsUnavailableWarning(blockchainLabel[fromBlockchain]);
    }
    await this.handlePreSwapModal(trade);

    const receiverAddress = this.receiverAddress;

    const { shouldCalculateGasPrice, gasPriceOptions } = await this.gasService.getGasInfo(
      blockchain
    );

    const referrer = this.sessionStorage.getItem('referral');
    const useMevBotProtection = this.settingsService.instantTradeValue.useMevBotProtection;
    let transactionHash: string;

    const preTradeId = await this.sendPreTradeInfo(trade);

    const options: SwapTransactionOptions = {
      onConfirm: (hash: string) => {
        transactionHash = hash;
        callback?.(hash);

        this.notifyGtmAfterSignTx(
          transactionHash,
          fromSymbol,
          toSymbol,
          fromAmount.multipliedBy(fromPrice),
          useMevBotProtection
        );

        this.postTrade(hash, trade, preTradeId);
      },
      ...(this.queryParamsService.testMode && { testMode: true }),
      ...(shouldCalculateGasPrice && { gasPriceOptions }),
      ...(receiverAddress && { receiverAddress }),
      useCacheData: params.useCacheData,
      // skipAmountCheck: params.skipAmountCheck,
      ...(referrer && { referrer })
    };

    try {
      await trade.swap(options);

      const [fromToken, toToken] = await Promise.all([
        this.tokensService.findToken(trade.from),
        this.tokensService.findToken(trade.to)
      ]);

      await this.conditionalAwait(fromBlockchain);
      await this.tokensService.updateTokenBalancesAfterItSwap(fromToken, toToken);

      if (
        trade instanceof OnChainTrade &&
        trade.from.blockchain === BLOCKCHAIN_NAME.TRON &&
        trade.type === ON_CHAIN_TRADE_TYPE.BRIDGERS
      ) {
        const txStatusData = await firstValueFrom(
          timer(7_000, 5_000).pipe(
            concatMap(() =>
              this.sdkService.onChainStatusManager.getBridgersSwapStatus(
                transactionHash,
                trade.slippageTolerance
              )
            ),
            first(
              statusData =>
                statusData.status === TX_STATUS.SUCCESS || statusData.status === TX_STATUS.FAIL
            ),
            catchError(err => {
              console.log(err);
              return of({ hash: null, status: TX_STATUS.PENDING });
            })
          )
        );
        if (txStatusData.status !== TX_STATUS.SUCCESS) {
          throw new TransactionFailedError(BLOCKCHAIN_NAME.TRON, txStatusData.hash);
        }
      }

      return transactionHash;
    } catch (err) {
      if (transactionHash && !this.isNotMinedError(err)) {
        await this.onChainApiService.patchTrade(transactionHash, false);
      }
      if (
        err instanceof NotWhitelistedProviderError ||
        err instanceof UnapprovedContractError ||
        err instanceof UnapprovedMethodError
      ) {
        this.saveNotWhitelistedProvider(err, fromBlockchain, (trade as OnChainTrade)?.type);
      }

      if (!(err instanceof UserRejectError)) {
        this.gtmService.fireSwapError(trade, this.authService.userAddress, err);
      }

      throw err;
    }
  }

  public async approveTrade(trade: OnChainTrade, callback?: (hash: string) => void): Promise<void> {
    if (!this.platformConfigurationService.isAvailableBlockchain(trade.from.blockchain)) {
      throw new BlockchainIsUnavailableWarning(blockchainLabel[trade.from.blockchain]);
    }
    if (!this.platformConfigurationService.isAvailableBlockchain(trade.to.blockchain)) {
      throw new BlockchainIsUnavailableWarning(blockchainLabel[trade.to.blockchain]);
    }
    const { blockchain, fromAmount, fromDecimals } = TradeParser.getItSwapParams(trade);

    const { shouldCalculateGasPrice, gasPriceOptions } = await this.gasService.getGasInfo(
      blockchain
    );

    const transactionOptions = {
      onTransactionHash: callback,
      ...(shouldCalculateGasPrice && { gasPriceOptions })
    };

    try {
      const amount = new BigNumber(Web3Pure.toWei(fromAmount, fromDecimals));

      await trade.approve(transactionOptions, true, amount);
    } catch (err) {
      if (err instanceof UnnecessaryApproveError) {
        return;
      }
      throw err;
    }
  }

  private notifyGtmAfterSignTx(
    transactionHash: string,
    fromToken: string,
    toToken: string,
    price: BigNumber,
    useMevBotProtection: boolean
  ): void {
    this.gtmService.fireTxSignedEvent(
      SWAP_PROVIDER_TYPE.INSTANT_TRADE,
      transactionHash,
      fromToken,
      toToken,
      new BigNumber(1),
      price,
      'onchain',
      price.gt(1000) ? useMevBotProtection : null
    );
  }

  private async postTrade(
    transactionHash: string,
    trade: OnChainTrade,
    preTradeId: string
  ): Promise<void> {
    const { blockchain } = TradeParser.getItSwapParams(trade);

    // Boba is too fast, status does not have time to get into the database.
    const waitTime = blockchain === BLOCKCHAIN_NAME.BOBA ? 3_000 : 0;
    await firstValueFrom(
      timer(waitTime).pipe(
        switchMap(() =>
          this.onChainApiService.createTrade(transactionHash, trade.type, trade, preTradeId)
        )
      )
    );
  }

  public saveNotWhitelistedProvider(
    error: NotWhitelistedProviderErrors,
    blockchain: BlockchainName,
    tradeType: OnChainTradeType
  ): void {
    if (error instanceof NotWhitelistedProviderError) {
      this.onChainApiService.saveNotWhitelistedProvider(error, blockchain, tradeType).subscribe();
    } else {
      this.onChainApiService
        .saveNotWhitelistedOnChainProvider(error, blockchain, tradeType)
        .subscribe();
    }
  }

  private isNotMinedError(err: Error): boolean {
    return (
      Boolean(err?.message?.includes) &&
      err.message.includes(
        'Transaction was not mined within 50 blocks, please make sure your transaction was properly sent. Be aware that it might still be mined!'
      )
    );
  }

  private async handlePreSwapModal(trade: OnChainTrade): Promise<void> {
    if (trade instanceof TonOnChainTrade && trade.additionalInfo.isMultistep) {
      const ok = await this.modalService.openTonSlippageWarning(trade);

      if (!ok) throw new UserRejectError();
    }
  }

  private async conditionalAwait(blockchain: BlockchainName): Promise<void> {
    if (blockchain === BLOCKCHAIN_NAME.SOLANA) {
      const waitTime = 3_000;
      await firstValueFrom(timer(waitTime));
    }
  }

  private calculateTimeoutForChains(): number {
    const { fromBlockchain } = this.swapFormService.inputValue;
    if (ON_CHAIN_LONG_TIMEOUT_CHAINS.includes(fromBlockchain)) {
      return 30_000;
    }
    return 10_000;
  }

  private saveTrade(
    providers: OnChainCalculatedTradeData[],
    trade: {
      fromAddress: string;
      toAddress: string;
      blockchain: BlockchainName;
      fromAmount: string;
    }
  ): void {
    this.onChainApiService
      .saveProvidersStatistics({
        user: this.walletConnectorService.address,
        from_token: trade.fromAddress,
        network: TO_BACKEND_BLOCKCHAINS?.[trade.blockchain],
        from_amount: trade.fromAmount,
        to_token: trade.toAddress,
        providers_statistics: providers.map(providerTrade => {
          const { calculationTime, wrappedTrade } = providerTrade;
          return {
            provider_title: wrappedTrade?.tradeType,
            calculation_time_in_seconds: String(calculationTime / 1000),
            to_amount: wrappedTrade?.trade?.to.stringWeiAmount,
            status: wrappedTrade?.trade ? 'success' : 'error',
            proxy_used: wrappedTrade?.trade?.feeInfo?.rubicProxy?.fixedFee?.amount?.gt(0),
            ...(wrappedTrade?.error && {
              additional_info: wrappedTrade.error.message
            })
          };
        })
      })
      .subscribe();
  }

  private async getOptions(
    fromSdkToken: PriceToken,
    toSdkToken: PriceToken,
    disabledProviders: OnChainTradeType[],
    fromAmount: BigNumber
  ): Promise<QuoteOptionsInterface> {
    const queryDisabledTradeTypes = this.queryParamsService.disabledOnChainProviders;
    const disabledTradeTypes = Array.from(
      new Set<OnChainTradeType>([...disabledProviders, ...queryDisabledTradeTypes])
    );

    const settings = this.settingsService.instantTradeValue;
    const slippageTolerance = settings.slippageTolerance / 100;
    const providerAddress = await this.proxyService.getIntegratorAddress(
      fromSdkToken,
      fromAmount,
      toSdkToken
    );

    const options: QuoteOptionsInterface = {
      slippage: slippageTolerance,
      nativeBlacklist: [...disabledTradeTypes],
      integratorAddress: providerAddress
    };

    return options;
  }

  private async sendPreTradeInfo(trade: OnChainTrade): Promise<string | null> {
    try {
      const preTradeId = await this.onChainApiService.sendPreTradeInfo(trade);
      return preTradeId;
    } catch {
      return null;
    }
  }
}
