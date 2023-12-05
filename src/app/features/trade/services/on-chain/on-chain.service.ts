import { Injectable } from '@angular/core';
import { firstValueFrom, forkJoin, interval, Observable, of, Subscription, timer } from 'rxjs';

import { filter, map, switchMap } from 'rxjs/operators';
import { SdkService } from '@core/services/sdk/sdk.service';
import { SwapsFormService } from '@features/trade/services/swaps-form/swaps-form.service';
import { TradeContainer } from '@features/trade/models/trade-container';
import {
  BLOCKCHAIN_NAME,
  BlockchainName,
  BlockchainsInfo,
  EvmEncodeConfig,
  Injector,
  NotWhitelistedProviderError,
  OnChainTrade,
  OnChainTradeType,
  PriceToken,
  SwapTransactionOptions,
  Token,
  TX_STATUS,
  UnnecessaryApproveError,
  UserRejectError,
  Web3Public,
  Web3Pure
} from 'rubic-sdk';
import BlockchainIsUnavailableWarning from '@core/errors/models/common/blockchain-is-unavailable.warning';
import { blockchainLabel } from '@shared/constants/blockchain/blockchain-label';
import { PlatformConfigurationService } from '@core/services/backend/platform-configuration/platform-configuration.service';
import { GasService } from '@core/services/gas-service/gas.service';
import { TokensService } from '@core/services/tokens/tokens.service';
import { AuthService } from '@core/services/auth/auth.service';
import BigNumber from 'bignumber.js';
import { SettingsService } from '@features/trade/services/settings-service/settings.service';
import { ENVIRONMENT } from '../../../../../environments/environment';
import { OnChainManagerCalculationOptions } from 'rubic-sdk/lib/features/on-chain/calculation-manager/models/on-chain-manager-calculation-options';
import { TargetNetworkAddressService } from '@features/trade/services/target-network-address-service/target-network-address.service';
import { GoogleTagManagerService } from '@core/services/google-tag-manager/google-tag-manager.service';
import { QueryParamsService } from '@core/services/query-params/query-params.service';
import { TransactionFailedError } from '@core/errors/models/common/transaction-failed-error';
import { OnChainApiService } from '@features/trade/services/on-chain-api/on-chain-api.service';
import { shouldCalculateGas } from '@features/trade/constants/should-calculate-gas';
import { SWAP_PROVIDER_TYPE } from '@features/trade/models/swap-provider-type';
import { TradeParser } from '@features/trade/utils/trade-parser';
import { RubicSdkErrorParser } from '@core/errors/models/rubic-sdk-error-parser';

@Injectable()
export class OnChainService {
  private get receiverAddress(): string | null {
    if (!this.settingsService.instantTradeValue.showReceiverAddress) {
      return null;
    }
    return this.targetNetworkAddressService.address;
  }

  private static isSwapAndEarnSwap(trade: OnChainTrade): boolean {
    return trade.feeInfo.rubicProxy?.fixedFee?.amount?.gt(0);
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
    private readonly queryParamsService: QueryParamsService
  ) {}

  public calculateTrades(disabledProviders: OnChainTradeType[]): Observable<TradeContainer> {
    const { fromToken, toToken, fromAmount } = this.swapFormService.inputValue;
    const chainType = BlockchainsInfo.getChainType(fromToken.blockchain);
    return forkJoin([
      this.tokensService.getAndUpdateTokenPrice(fromToken, true),
      PriceToken.createToken(fromToken),
      this.tokensService.getAndUpdateTokenPrice(toToken, true),
      PriceToken.createToken(toToken)
    ]).pipe(
      switchMap(([fromTokenPrice, fromPriceToken, toTokenPrice, toPriceToken]) =>
        forkJoin([
          this.sdkService.deflationTokenManager.isDeflationToken(fromPriceToken),
          of(
            new PriceToken({
              ...fromPriceToken.asStruct,
              price: new BigNumber(fromTokenPrice)
            })
          ),
          this.sdkService.deflationTokenManager.isDeflationToken(toPriceToken),
          of(
            new PriceToken({
              ...toPriceToken.asStruct,
              price: new BigNumber(toTokenPrice)
            })
          ),
          Web3Pure[chainType].isAddressCorrect(this.authService.userAddress)
        ])
      ),
      switchMap(
        ([
          deflationFromStatus,
          fromSdkToken,
          deflationToStatus,
          toSdkToken,
          isAddressCorrectValue
        ]) => {
          const calculateGas =
            shouldCalculateGas[fromToken.blockchain] &&
            this.authService.userAddress &&
            isAddressCorrectValue;

          const queryDisabledTradeTypes = this.queryParamsService.disabledOnChainProviders;
          const disabledTradeTypes = Array.from(
            new Set<OnChainTradeType>([...disabledProviders, ...queryDisabledTradeTypes])
          );

          const settings = this.settingsService.instantTradeValue;
          const slippageTolerance = settings.slippageTolerance / 100;
          const disableMultihops = settings.disableMultihops;
          const deadlineMinutes = settings.deadline;
          const useProxy =
            deflationFromStatus.isDeflation || deflationToStatus.isDeflation
              ? false
              : this.platformConfigurationService.useOnChainProxy;
          const providerAddress = this.getProviderAddressBasedOnPromo(toToken.blockchain);

          const options: OnChainManagerCalculationOptions = {
            timeout: 10000,
            gasCalculation: calculateGas ? 'calculate' : 'disabled',
            zrxAffiliateAddress: ENVIRONMENT.zrxAffiliateAddress,
            slippageTolerance,
            disableMultihops,
            deadlineMinutes,
            useProxy,
            disabledProviders: disabledTradeTypes,
            ...(providerAddress && { providerAddress })
          };

          return this.sdkService.instantTrade.calculateTradeReactively(
            fromSdkToken,
            fromAmount.actualValue.toFixed(),
            toSdkToken,
            options
          );
        }
      ),
      map(el => ({ value: el, type: SWAP_PROVIDER_TYPE.INSTANT_TRADE }))
    );
  }

  private getProviderAddressBasedOnPromo(toChain: BlockchainName): string {
    if (toChain === BLOCKCHAIN_NAME.MANTA_PACIFIC) {
      return '0x77dC28028A09DF50Cf037cfFdC002B7969530CCb';
    }

    return '';
  }

  public async swapTrade(
    trade: OnChainTrade,
    callback?: (hash: string) => void,
    directTransaction?: EvmEncodeConfig
  ): Promise<void> {
    const fromBlockchain = trade.from.blockchain;

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

    const receiverAddress = this.receiverAddress;

    const { shouldCalculateGasPrice, gasPriceOptions } = await this.gasService.getGasInfo(
      blockchain
    );

    const isSwapAndEarnTrade = OnChainService.isSwapAndEarnSwap(trade);
    let transactionHash: string;

    const options: SwapTransactionOptions = {
      onConfirm: (hash: string) => {
        transactionHash = hash;
        callback?.(hash);

        this.notifyGtmAfterSignTx(
          transactionHash,
          fromSymbol,
          toSymbol,
          fromAmount.multipliedBy(fromPrice)
        );

        this.postTrade(hash, trade, isSwapAndEarnTrade);
      },
      ...(this.queryParamsService.testMode && { testMode: true }),
      ...(shouldCalculateGasPrice && { gasPriceOptions }),
      ...(receiverAddress && { receiverAddress }),
      ...(directTransaction && { directTransaction })
    };

    try {
      await trade.swap(options);

      const [fromToken, toToken] = await Promise.all([
        this.tokensService.findToken(trade.from),
        this.tokensService.findToken(trade.to)
      ]);
      await this.tokensService.updateTokenBalancesAfterItSwap(fromToken, toToken);

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
        if (txStatusData.status !== TX_STATUS.SUCCESS) {
          throw new TransactionFailedError(BLOCKCHAIN_NAME.TRON, txStatusData.hash);
        }
      }

      this.updateTrade(transactionHash, true);
    } catch (err) {
      if (err instanceof NotWhitelistedProviderError) {
        this.saveNotWhitelistedProvider(err, fromBlockchain, (trade as OnChainTrade)?.type);
      }

      if (!(err instanceof UserRejectError)) {
        this.gtmService.fireTransactionError(trade.from.name, trade.to.name, err.code);
      }

      if (transactionHash && !this.isNotMinedError(err)) {
        this.updateTrade(transactionHash, false);
      }

      throw RubicSdkErrorParser.parseError(err);
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

  private async postTrade(
    transactionHash: string,
    trade: OnChainTrade,
    isSwapAndEarnSwap: boolean
  ): Promise<void> {
    let fee: number;
    let promoCode: string;
    const { blockchain } = TradeParser.getItSwapParams(trade);

    // Boba is too fast, status does not have time to get into the database.
    const waitTime = blockchain === BLOCKCHAIN_NAME.BOBA ? 3_000 : 0;
    await firstValueFrom(
      timer(waitTime).pipe(
        switchMap(() =>
          this.onChainApiService.createTrade(
            transactionHash,
            trade.type,
            trade,
            isSwapAndEarnSwap,
            fee,
            promoCode
          )
        )
      )
    );
  }

  private updateTrade(hash: string, success: boolean): Subscription {
    return this.onChainApiService.patchTrade(hash, success).subscribe({
      error: err => console.debug('IT patch request is failed', err)
    });
  }

  public saveNotWhitelistedProvider(
    error: NotWhitelistedProviderError,
    blockchain: BlockchainName,
    tradeType: OnChainTradeType
  ): void {
    this.onChainApiService.saveNotWhitelistedProvider(error, blockchain, tradeType).subscribe();
  }

  private isNotMinedError(err: Error): boolean {
    return (
      Boolean(err?.message?.includes) &&
      err.message.includes(
        'Transaction was not mined within 50 blocks, please make sure your transaction was properly sent. Be aware that it might still be mined!'
      )
    );
  }
}
