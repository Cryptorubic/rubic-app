import { Injectable } from '@angular/core';
import { SwapFormService } from '@core/services/swaps/swap-form.service';
import { firstValueFrom, interval, Subscription, switchMap, timer } from 'rxjs';
import BigNumber from 'bignumber.js';
import { InstantTradesApiService } from '@core/services/backend/instant-trades-api/instant-trades-api.service';
import { GoogleTagManagerService } from '@core/services/google-tag-manager/google-tag-manager.service';
import { SWAP_PROVIDER_TYPE } from '@features/swaps/features/swap-form/models/swap-provider-type';
import { IframeService } from '@core/services/iframe/iframe.service';
import { TradeCalculationService } from '@features/swaps/core/services/trade-service/trade-calculation.service';
import {
  BLOCKCHAIN_NAME,
  BlockchainName,
  BlockchainsInfo,
  Injector,
  NotWhitelistedProviderError,
  OnChainTrade,
  OnChainTradeError,
  OnChainTradeType,
  PriceToken,
  SwapTransactionOptions,
  Token,
  TX_STATUS,
  UnnecessaryApproveError,
  Web3Public,
  Web3Pure
} from 'rubic-sdk';
import { SdkService } from '@core/services/sdk/sdk.service';
import { SettingsService } from '@features/swaps/core/services/settings-service/settings.service';
import { shouldCalculateGas } from '@features/swaps/features/instant-trade/services/instant-trade-service/constants/should-calculate-gas';
import { AuthService } from '@core/services/auth/auth.service';
import { GasService } from '@core/services/gas-service/gas.service';
import { TradeParser } from '@features/swaps/features/instant-trade/services/instant-trade-service/utils/trade-parser';
import { ENVIRONMENT } from 'src/environments/environment';
import { TargetNetworkAddressService } from '@features/swaps/core/services/target-network-address-service/target-network-address.service';
import { filter } from 'rxjs/operators';
import { TransactionFailedError } from '@core/errors/models/common/transaction-failed-error';
import { PlatformConfigurationService } from '@app/core/services/backend/platform-configuration/platform-configuration.service';
import BlockchainIsUnavailableWarning from '@app/core/errors/models/common/blockchain-is-unavailable.warning';
import { blockchainLabel } from '@app/shared/constants/blockchain/blockchain-label';
import { SwapFormInputTokens } from '@core/services/swaps/models/swap-form-tokens';
import { RubicError } from '@core/errors/models/rubic-error';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import { RecentTradesStoreService } from '@core/services/recent-trades/recent-trades-store.service';
import { QueryParamsService } from '@core/services/query-params/query-params.service';
import { TokensService } from '@core/services/tokens/tokens.service';

@Injectable()
export class InstantTradeService extends TradeCalculationService {
  private static readonly unsupportedItNetworks: BlockchainName[] = [
    BLOCKCHAIN_NAME.BITGERT,
    BLOCKCHAIN_NAME.OASIS,
    BLOCKCHAIN_NAME.METIS
  ];

  public static isSupportedBlockchain(blockchain: BlockchainName): boolean {
    return !InstantTradeService.unsupportedItNetworks.includes(blockchain);
  }

  private get receiverAddress(): string | null {
    if (!this.settingsService.instantTradeValue.showReceiverAddress) {
      return null;
    }
    return this.targetNetworkAddressService.address;
  }

  /**
   Returns form input value.
   * Must be used only if form contains blockchains asset types.
   */
  public get inputValue(): SwapFormInputTokens {
    const inputForm = this.swapFormService.inputValue;
    if (inputForm.fromAssetType && !BlockchainsInfo.isBlockchainName(inputForm.fromAssetType)) {
      throw new RubicError('Cannot use instant trades');
    }
    return {
      ...inputForm,
      fromBlockchain: inputForm.fromAssetType as BlockchainName,
      fromToken: inputForm.fromAsset as TokenAmount
    };
  }

  constructor(
    private readonly instantTradesApiService: InstantTradesApiService,
    private readonly iframeService: IframeService,
    private readonly gtmService: GoogleTagManagerService,
    private readonly swapFormService: SwapFormService,
    private readonly settingsService: SettingsService,
    private readonly sdkService: SdkService,
    private readonly authService: AuthService,
    private readonly gasService: GasService,
    private readonly targetNetworkAddressService: TargetNetworkAddressService,
    private readonly platformConfigurationService: PlatformConfigurationService,
    private readonly recentTradesStoreService: RecentTradesStoreService,
    private readonly queryParamsService: QueryParamsService,
    private readonly tokensService: TokensService
  ) {
    super('on-chain');
  }

  private static isSwapAndEarnSwap(trade: OnChainTrade): boolean {
    return trade.feeInfo.rubicProxy.fixedFee.amount.gt(0);
  }

  public async needApprove(trade: OnChainTrade): Promise<boolean> {
    return trade.needApprove();
  }

  public async approve(trade: OnChainTrade): Promise<void> {
    if (!this.platformConfigurationService.isAvailableBlockchain(trade.from.blockchain)) {
      throw new BlockchainIsUnavailableWarning(blockchainLabel[trade.from.blockchain]);
    }
    if (!this.platformConfigurationService.isAvailableBlockchain(trade.to.blockchain)) {
      throw new BlockchainIsUnavailableWarning(blockchainLabel[trade.to.blockchain]);
    }
    this.checkDeviceAndShowNotification();
    let subscription$: Subscription;
    const { blockchain, fromAmount, fromDecimals } = TradeParser.getItSwapParams(trade);

    const { shouldCalculateGasPrice, gasPriceOptions } = await this.gasService.getGasInfo(
      blockchain
    );

    const transactionOptions = {
      onTransactionHash: () => {
        subscription$ = this.notificationsService.showApproveInProgress();
      },
      ...(shouldCalculateGasPrice && { gasPriceOptions })
    };

    try {
      const amount = new BigNumber(Web3Pure.toWei(fromAmount, fromDecimals));
      await trade.approve(transactionOptions, true, amount);

      this.notificationsService.showApproveSuccessful();
    } catch (err) {
      if (err instanceof UnnecessaryApproveError) {
        return;
      }
      throw err;
    } finally {
      subscription$?.unsubscribe();
    }
  }

  public async calculateTrades(
    fromToken: TokenAmount,
    fromAmount: string,
    toToken: TokenAmount
  ): Promise<Array<OnChainTrade | OnChainTradeError>> {
    const settings = this.settingsService.instantTradeValue;
    const slippageTolerance = settings.slippageTolerance / 100;
    const disableMultihops = settings.disableMultihops;
    const deadlineMinutes = settings.deadline;

    const fromTokenPrice = await this.tokensService.getAndUpdateTokenPrice(fromToken, true);
    const toTokenPrice = await this.tokensService.getAndUpdateTokenPrice(toToken, true);

    const chainType = BlockchainsInfo.getChainType(fromToken.blockchain);
    const isAddressCorrectValue = await Web3Pure[chainType].isAddressCorrect(
      this.authService.userAddress
    );
    const calculateGas =
      shouldCalculateGas[fromToken.blockchain] &&
      this.authService.userAddress &&
      isAddressCorrectValue;

    const sdkFromToken = await PriceToken.createToken(fromToken);
    const deflationFromStatus = await this.sdkService.deflationTokenManager.isDeflationToken(
      sdkFromToken
    );

    const sdkToToken = await PriceToken.createToken(toToken);
    const deflationToStatus = await this.sdkService.deflationTokenManager.isDeflationToken(
      sdkToToken
    );

    const fromSdkCompatibleToken = new PriceToken({
      ...sdkFromToken.asStruct,
      price: new BigNumber(fromTokenPrice)
    });
    const toSdkCompatibleToken = new PriceToken({
      ...sdkToToken.asStruct,
      price: new BigNumber(toTokenPrice)
    });

    const useProxy =
      deflationFromStatus.isDeflation || deflationToStatus.isDeflation
        ? false
        : this.platformConfigurationService.useOnChainProxy;
    const providerAddress =
      toToken.blockchain === BLOCKCHAIN_NAME.LINEA && '0x77dC28028A09DF50Cf037cfFdC002B7969530CCb';

    return this.sdkService.instantTrade.calculateTrade(
      fromSdkCompatibleToken,
      fromAmount,
      toSdkCompatibleToken,
      {
        timeout: 10000,
        gasCalculation: calculateGas ? 'calculate' : 'disabled',
        zrxAffiliateAddress: ENVIRONMENT.zrxAffiliateAddress,
        slippageTolerance,
        disableMultihops,
        deadlineMinutes,
        useProxy,
        ...(providerAddress && { providerAddress })
      }
    );
  }

  public async createTrade(
    providerName: OnChainTradeType,
    trade: OnChainTrade,
    confirmCallback?: () => void
  ): Promise<void> {
    const { fromBlockchain } = this.inputValue;
    this.checkDeviceAndShowNotification();

    const { fromSymbol, toSymbol, fromAmount, fromPrice, blockchain, fromAddress, fromDecimals } =
      TradeParser.getItSwapParams(trade);

    if (!this.platformConfigurationService.isAvailableBlockchain(fromBlockchain)) {
      throw new BlockchainIsUnavailableWarning(blockchainLabel[fromBlockchain]);
    }

    const blockchainAdapter: Web3Public = Injector.web3PublicService.getWeb3Public(blockchain);
    await blockchainAdapter.checkBalance(
      { address: fromAddress, decimals: fromDecimals, symbol: fromSymbol } as Token,
      fromAmount,
      this.authService.userAddress
    );

    let transactionHash: string;
    let subscription$: Subscription;

    const receiverAddress = this.receiverAddress;

    const { shouldCalculateGasPrice, gasPriceOptions } = await this.gasService.getGasInfo(
      blockchain
    );

    const isSwapAndEarnTrade = InstantTradeService.isSwapAndEarnSwap(trade);

    const options: SwapTransactionOptions = {
      onConfirm: (hash: string) => {
        transactionHash = hash;
        confirmCallback?.();

        const onramperTxId = this.queryParamsService.queryParams.onramperTxId;
        if (onramperTxId) {
          this.recentTradesStoreService.updateOnramperTargetTrade(onramperTxId, hash);
          this.queryParamsService.patchQueryParams({ onramperTxId: null });
        }

        this.notifyGtmAfterSignTx(
          transactionHash,
          fromSymbol,
          toSymbol,
          fromAmount.multipliedBy(fromPrice)
        );

        subscription$ = this.notifyTradeInProgress(hash, blockchain, isSwapAndEarnTrade);

        this.postTrade(hash, providerName, trade, isSwapAndEarnTrade);
      },
      ...(this.queryParamsService.testMode && { testMode: true }),
      ...(shouldCalculateGasPrice && { gasPriceOptions }),
      ...(receiverAddress && { receiverAddress })
    };

    try {
      await trade.swap(options);

      if (trade instanceof OnChainTrade && trade.from.blockchain === BLOCKCHAIN_NAME.TRON) {
        const txStatusData = await firstValueFrom(
          interval(7_000).pipe(
            switchMap(() =>
              this.sdkService.onChainStatusManager.getBridgersSwapStatus(transactionHash)
            ),
            filter(
              statusData =>
                statusData.status === TX_STATUS.SUCCESS || statusData.status === TX_STATUS.FAIL
            )
          )
        );
        subscription$.unsubscribe();
        if (txStatusData.status === TX_STATUS.SUCCESS) {
          this.showSuccessTrxNotification();
        } else {
          throw new TransactionFailedError(BLOCKCHAIN_NAME.TRON, txStatusData.hash);
        }
      } else {
        subscription$.unsubscribe();
        this.showSuccessTrxNotification();
      }

      this.updateTrade(transactionHash, true);
    } catch (err) {
      subscription$?.unsubscribe();

      if (err instanceof NotWhitelistedProviderError) {
        this.saveNotWhitelistedProvider(err, fromBlockchain, (trade as OnChainTrade)?.type);
      }

      if (transactionHash && !this.isNotMinedError(err)) {
        this.updateTrade(transactionHash, false);
      }

      throw err;
    }
  }

  private async postTrade(
    transactionHash: string,
    providerName: OnChainTradeType,
    trade: OnChainTrade,
    isSwapAndEarnSwap: boolean
  ): Promise<void> {
    let fee: number;
    let promoCode: string;
    const { blockchain } = TradeParser.getItSwapParams(trade);

    // Boba is too fast, status does not have time to get into the database.
    const waitTime = blockchain === BLOCKCHAIN_NAME.BOBA ? 3_000 : 0;
    await timer(waitTime)
      .pipe(
        switchMap(() =>
          this.instantTradesApiService.createTrade(
            transactionHash,
            providerName,
            trade,
            isSwapAndEarnSwap,
            fee,
            promoCode
          )
        )
      )
      .toPromise();
  }

  /**
   * Checks if error is that transaction was not yet mined.
   * @param err Error thrown during creating transaction.
   */
  private isNotMinedError(err: Error): boolean {
    return (
      Boolean(err?.message?.includes) &&
      err.message.includes(
        'Transaction was not mined within 50 blocks, please make sure your transaction was properly sent. Be aware that it might still be mined!'
      )
    );
  }

  /**
   * Calls api service method to update transaction's status.
   * @param hash Transaction's hash.
   * @param success If true status is `completed`, otherwise `cancelled`.
   */
  private updateTrade(hash: string, success: boolean): Subscription {
    return this.instantTradesApiService.patchTrade(hash, success).subscribe({
      error: err => console.debug('IT patch request is failed', err)
    });
  }

  private notifyGtmAfterSignTx(
    transactionHash: string,
    fromToken: string,
    toToken: string,
    price: BigNumber
  ): void {
    this.gtmService.fireTxSignedEvent(
      SWAP_PROVIDER_TYPE.INSTANT_TRADE,
      transactionHash,
      fromToken,
      toToken,
      new BigNumber(1),
      price
    );
  }

  private checkDeviceAndShowNotification(): void {
    if (this.iframeService.isIframe && this.iframeService.device === 'mobile') {
      this.notificationsService.showOpenMobileWallet();
    }
  }

  public saveNotWhitelistedProvider(
    error: NotWhitelistedProviderError,
    blockchain: BlockchainName,
    tradeType: OnChainTradeType
  ): void {
    this.instantTradesApiService
      .saveNotWhitelistedProvider(error, blockchain, tradeType)
      .subscribe();
  }
}
