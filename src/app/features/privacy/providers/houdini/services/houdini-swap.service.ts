import { Injectable } from '@angular/core';
import { NotificationsService } from '@app/core/services/notifications/notifications.service';
import { RubicApiService } from '@app/core/services/sdk/sdk-legacy/rubic-api/rubic-api.service';
import { SdkLegacyService } from '@app/core/services/sdk/sdk-legacy/sdk-legacy.service';
import {
  BlockchainName,
  ErrorInterface,
  QuoteRequestInterface,
  QuoteResponseInterface,
  TokenAmount,
  Token,
  EvmBlockchainName,
  BlockchainsInfo,
  CHAIN_TYPE
} from '@cryptorubic/core';
import { Token as SharedToken } from '@app/shared/models/tokens/token';
import { RubicSdkError } from '@cryptorubic/web3';
import BigNumber from 'bignumber.js';
import {
  BehaviorSubject,
  filter,
  interval,
  startWith,
  switchMap,
  takeWhile,
  map,
  tap,
  Subscription,
  combineLatest,
  of,
  distinctUntilChanged,
  combineLatestWith,
  from
} from 'rxjs';
import { WalletConnectorService } from '@app/core/services/wallets/wallet-connector-service/wallet-connector.service';
import { TransformUtils } from '@app/core/services/sdk/sdk-legacy/features/ws-api/transform-utils';
import { CrossChainTrade } from '@app/core/services/sdk/sdk-legacy/features/cross-chain/calculation-manager/providers/common/cross-chain-trade';
import { CrossChainService } from '@app/features/trade/services/cross-chain/cross-chain.service';
import DelayedApproveError from '@app/core/errors/models/common/delayed-approve.error';
import { RubicError } from '@app/core/errors/models/rubic-error';
import { RateChangeInfo } from '@app/features/trade/models/rate-change-info';
import { ERROR_TYPE } from '@app/core/errors/models/error-type';
import { SWAP_PROVIDER_TYPE } from '@app/features/trade/models/swap-provider-type';
import AmountChangeWarning from '@app/core/errors/models/cross-chain/amount-change-warning';
import { PrivateSwapWindowService } from '../../shared-privacy-providers/services/private-swap-window/private-swap-window.service';
import { UserRejectError } from '@app/core/errors/models/provider/user-reject-error';
import { SettingsService } from '@app/features/trade/services/settings-service/settings.service';
import InsufficientFundsError from '@core/errors/models/instant-trade/insufficient-funds-error';
import { InsufficientGasError } from '@app/core/errors/models/common/insufficient-gas-error';
import { HoudiniErrorService } from './houdini-error.service';
import {
  transferTradeSupportedProviders,
  TransferTradeType
} from '@app/core/services/sdk/sdk-legacy/features/cross-chain/calculation-manager/providers/common/cross-chain-transfer-trade/constans/transfer-trade-supported-providers';
import {
  API_STATUS_TO_DEPOSIT_STATUS,
  CROSS_CHAIN_DEPOSIT_STATUS,
  CrossChainDepositStatus
} from '@app/core/services/sdk/sdk-legacy/features/cross-chain/calculation-manager/providers/common/cross-chain-transfer-trade/models/cross-chain-deposit-statuses';
import { CrossChainTransferTrade } from '@app/core/services/sdk/sdk-legacy/features/cross-chain/calculation-manager/providers/common/cross-chain-transfer-trade/cross-chain-transfer-trade';
import { DepositTradeData } from '../../shared-privacy-providers/models/deposit-trade-data';
import { PrivateStatisticsService } from '../../shared-privacy-providers/services/private-statistics/private-statistics.service';
import { compareTokens } from '@app/shared/utils/utils';
import { AsyncValidatorFn, FormControl } from '@angular/forms';
import { isReceiverCorrect } from '../constants/receiver-validator';

@Injectable()
export class HoudiniSwapService {
  private _currentReceiverFieldValidator: AsyncValidatorFn;

  private readonly _currentTradeData$ = new BehaviorSubject<DepositTradeData | null>(null);

  private readonly _requireReceiverAddress$ = new BehaviorSubject<boolean>(true);

  public readonly requireReceiverAddress$ = this._requireReceiverAddress$.asObservable();

  // private readonly _paymentInfo$ = new BehaviorSubject<CrossChainPaymentInfo | null>(null);

  public readonly depositTradeData$ = this._currentTradeData$.pipe(
    map(t => ({
      trade:
        t?.trade instanceof CrossChainTransferTrade ? (t.trade as CrossChainTransferTrade) : null,
      ...(t?.paymentInfo && { paymentInfo: t.paymentInfo })
    }))
  );

  public readonly subscriptions: Subscription[] = [];

  private readonly _depositTradeStatus$ = new BehaviorSubject<CrossChainDepositStatus>(
    CROSS_CHAIN_DEPOSIT_STATUS.WAITING
  );

  public readonly depositTradeStatus$ = this._depositTradeStatus$.asObservable();

  public get currentTrade(): CrossChainTrade {
    return this._currentTradeData$.value?.trade;
  }

  public get requireReceiverAddress(): boolean {
    return this._requireReceiverAddress$.value;
  }

  constructor(
    private readonly rubicApiService: RubicApiService,
    private readonly sdkLegacyService: SdkLegacyService,
    private readonly notificationsService: NotificationsService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly crossChainService: CrossChainService,
    private readonly privateSwapWindowService: PrivateSwapWindowService,
    private readonly settingsService: SettingsService,
    private readonly houdiniErrorService: HoudiniErrorService,
    private readonly privateStatisticsService: PrivateStatisticsService
  ) {
    this.subscribeOnStatusUpdate();
  }

  public async quote(
    fromToken: TokenAmount<BlockchainName>,
    toToken: SharedToken,
    receiver: string
  ): Promise<
    | {
        tradeId: string;
        tokenAmount: string;
        tokenAmountWei: BigNumber;
      }
    | { tradeError: ErrorInterface }
  > {
    this.resetCurrentTrade();

    const chainType = BlockchainsInfo.getChainType(fromToken.blockchain);
    const fromAddress = this.walletConnectorService?.address;
    const receiverAddress = this.requireReceiverAddress
      ? receiver
      : this.walletConnectorService.address;

    const quoteRequest: QuoteRequestInterface = {
      srcTokenBlockchain: fromToken.blockchain,
      srcTokenAddress: fromToken.address,
      srcTokenAmount: fromToken.tokenAmount.toString(),
      dstTokenBlockchain: toToken.blockchain,
      dstTokenAddress: toToken.address,
      preferredProvider: 'houdini',
      receiver: receiverAddress,
      showDangerousRoutes: true,
      showFailedRoutes: true,
      ...(chainType === CHAIN_TYPE.EVM && fromAddress && { fromAddress })
    };

    try {
      const quoteResponse = await this.rubicApiService.quoteAllRoutes(quoteRequest);
      if (quoteResponse) {
        const route = quoteResponse.routes[0];
        if (route) {
          this.filterHoudiniSlippageWarning(route);

          const tokenAmount = route.estimate.destinationTokenAmount;
          const tokenAmountWei = new BigNumber(route.estimate.destinationWeiAmount);

          //TODO: change it later
          if (!tokenAmount || !tokenAmountWei) {
            return {
              tradeError: { code: 2001, reason: 'No routes found' }
            };
          }

          await this.setCurrentTrade(quoteRequest, route, receiver);

          return {
            tradeId: route.id,
            tokenAmount,
            tokenAmountWei
          };
        }

        const failed = quoteResponse.failed[0];
        return {
          tradeError: failed.data
        };
      }
    } catch (err) {
      return this.parseQuoteError(err);
    }
  }

  public async swap(
    fromToken: TokenAmount<BlockchainName>,
    receiverAddress: string
  ): Promise<void> {
    try {
      const chainType = BlockchainsInfo.getChainType(fromToken.blockchain);
      const isTransferTrade =
        transferTradeSupportedProviders.includes(this.currentTrade.type as TransferTradeType) &&
        chainType !== CHAIN_TYPE.EVM;

      if (!isTransferTrade) {
        //TODO: maybe add some callback later
        const approveCallback = {
          onHash: (_: string) => {},
          onSwap: (..._: unknown[]) => {},
          onError: () => {}
        };

        const tradeInfo = this.currentTrade.getTradeInfo();
        const estimatedSwapDuration = tradeInfo.durationInMinutes;
        const swapCallback = {
          onHash: (_: string) => {},
          onSwap: () => {
            //TODO: change text later
            this.notificationsService.showInfo(
              `Transaction has started. Please wait ${
                estimatedSwapDuration ?? '20-40'
              } minutes until the operation is complete.`
            );
          },
          onError: (_: RubicError<ERROR_TYPE> | null) => {},
          onSimulationSuccess: () => Promise.resolve<boolean>(true),
          onRateChange: (_: RateChangeInfo) => Promise.resolve<boolean>(true)
        };

        await this.handleApprove(this.currentTrade, approveCallback);
        await this.handleSwap(this.currentTrade, receiverAddress, true, swapCallback);

        this.privateStatisticsService.saveAction(
          'PRIVATE_CROSSCHAIN_SWAP',
          'HOUDINI',
          this.walletConnectorService.address,
          fromToken.address,
          fromToken.weiAmount.toFixed(),
          fromToken.blockchain
        );
      }
    } catch (err) {
      this.showSwapError(err);
    }
  }

  public async handleApprove(
    trade: CrossChainTrade,
    callback?: {
      onHash?: (hash: string) => void;
      onSwap?: (...args: unknown[]) => void;
      onError?: () => void;
    }
  ): Promise<void> {
    try {
      await this.crossChainService.approveTrade(trade, callback.onHash);
      callback?.onSwap();
    } catch (err) {
      if (err?.message?.includes('Method is not supported')) {
        return Promise.resolve();
      }

      console.error(err);
      callback?.onError();
      let error = err;
      if (err?.message?.includes('Transaction was not mined within 50 blocks')) {
        error = new DelayedApproveError();
      }
      throw error;
      // this.errorsService.catch(error);
    }
  }

  public async handleSwap(
    trade: CrossChainTrade,
    receiverAddress: string,
    checkSlippageAndPI?: boolean,
    callback?: {
      onHash?: (hash: string) => void;
      onSwap?: () => void;
      onError?: (err: RubicError<ERROR_TYPE> | null) => void;
      onSimulationSuccess?: () => Promise<boolean>;
      onRateChange?: (rateChangeInfo: RateChangeInfo) => Promise<boolean>;
    }
  ): Promise<void> {
    let txHash: string;

    try {
      const isEqualFromAmount = this.checkIsEqualFromAmount(trade.from.tokenAmount);
      if (!isEqualFromAmount) {
        throw new Error('Trade has invalid from amount');
      }

      const allowSlippageAndPI = checkSlippageAndPI
        ? await this.settingsService.checkSlippageAndPriceImpact(
            SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING,
            trade
          )
        : true;

      if (!allowSlippageAndPI) {
        callback.onError?.(null);
        return;
      }

      txHash = await this.crossChainService.swapTrade(
        trade,
        callback.onHash,
        callback.onSimulationSuccess,
        {
          skipAmountCheck: false,
          useCacheData: false,
          receiverAddress
        }
      );
    } catch (err) {
      if (err instanceof AmountChangeWarning) {
        const rateChangeInfo = {
          oldAmount: Token.fromWei(err.oldAmount, trade.to.decimals),
          newAmount: Token.fromWei(err.newAmount, trade.to.decimals),
          tokenSymbol: trade.to.symbol
        };

        const allowSwap = await callback.onRateChange(rateChangeInfo);

        if (allowSwap) {
          try {
            txHash = await this.crossChainService.swapTrade(
              trade,
              callback.onHash,
              callback.onSimulationSuccess,
              {
                skipAmountCheck: true,
                useCacheData: true,
                receiverAddress
              }
            );
          } catch (innerErr) {
            throw innerErr;
            // this.catchSwapError(innerErr, trade, callback?.onError);
          }
        } else {
          throw new UserRejectError();
          // this.catchSwapError(new SdkUserRejectError(), trade, callback?.onError);
        }
      } else {
        throw err;
        // this.catchSwapError(err, trade, callback?.onError);
      }
    }

    if (txHash) {
      callback.onSwap?.();
    }
  }

  public resetCurrentTrade(): void {
    this._currentTradeData$.next(null);
  }

  private checkIsEqualFromAmount(fromAmount: BigNumber): boolean {
    const swapInfo = this.privateSwapWindowService.swapInfo;
    const formSourceTokenAmount = swapInfo.fromAmount.actualValue;
    const formSourceTokenDecimals = swapInfo.fromAsset.decimals;

    const formSourceTokenWeiAmount = Token.toWei(formSourceTokenAmount, formSourceTokenDecimals);
    const formSourceTokenNonWeiAmount = Token.fromWei(
      formSourceTokenWeiAmount,
      formSourceTokenDecimals
    );

    return fromAmount.eq(formSourceTokenNonWeiAmount);
  }

  public subscribeOnFormUpdate(receiverCtrl: FormControl<string>): void {
    const sub1 = this.privateSwapWindowService.swapInfo$
      .pipe(
        distinctUntilChanged((prev, curr) => {
          return (
            compareTokens(prev.fromAsset, curr.fromAsset) &&
            compareTokens(prev.toAsset, curr.toAsset)
          );
        }),
        combineLatestWith(this.walletConnectorService.networkChange$)
      )
      .subscribe(([swapInfo, walletBlockchain]) => {
        const requireReceiverAddress = this.checkIfReceiverAdressFormRequired(
          walletBlockchain,
          swapInfo.toAsset?.blockchain
        );
        this._requireReceiverAddress$.next(requireReceiverAddress);

        this.resetCurrentTrade();

        if (!swapInfo.toAsset?.blockchain) return;

        if (this._currentReceiverFieldValidator) {
          receiverCtrl.removeAsyncValidators(this._currentReceiverFieldValidator);
        }
        this._currentReceiverFieldValidator = isReceiverCorrect(swapInfo.toAsset.blockchain);

        receiverCtrl.addAsyncValidators(this._currentReceiverFieldValidator);
        receiverCtrl.updateValueAndValidity();
      });

    const sub2 = this.privateSwapWindowService.swapInfo$
      .pipe(
        switchMap(swapInfo => from(this.switchWalletChainIfNeeded(swapInfo.fromAsset?.blockchain)))
      )
      .subscribe();

    this.subscriptions.push(sub1);
    this.subscriptions.push(sub2);
  }

  private checkIfReceiverAdressFormRequired(
    walletBlockchain: BlockchainName,
    toBlockchain: BlockchainName
  ): boolean {
    if (!walletBlockchain) return true;

    const walletChainType = BlockchainsInfo.getChainType(walletBlockchain);
    const toChainType = toBlockchain ? BlockchainsInfo.getChainType(toBlockchain) : null;

    return !(toChainType === CHAIN_TYPE.EVM && walletChainType === CHAIN_TYPE.EVM);
  }

  //TODO: check is it okay to do it - without the filter it fails each time on trade parsing because of hardcoded API 7001 (SlippageChangedWarning) error
  private filterHoudiniSlippageWarning(quoteResponse: QuoteResponseInterface): void {
    quoteResponse.warnings = quoteResponse.warnings.filter(
      w =>
        !(
          w.code === 7001 &&
          w.reason.includes('Slippage for houdini is set automatically and can vary from 0 to 5%.')
        )
    );
  }

  private parseQuoteError(error: RubicSdkError): { tradeError: ErrorInterface } {
    //TODO: refactor this later maybe
    if (
      error.message.includes('No routes found.') ||
      error.message.includes('Request failed with status code 500')
    ) {
      return {
        tradeError: {
          code: 2001,
          reason: 'No routes found'
        }
      };
    }
  }

  private showSwapError(error: RubicError<ERROR_TYPE>): void {
    if (error instanceof InsufficientFundsError) {
      this.notificationsService.showError('Insufficient funds.');
      this.houdiniErrorService.setTradeError({ reason: 'Insufficient balance' });
    }
    if (error instanceof InsufficientGasError) {
      this.notificationsService.showError('Insufficient gas.');
      this.houdiniErrorService.setTradeError({ reason: 'Insufficient gas' });
    }
    console.error(error);
  }

  private async setCurrentTrade(
    quoteRequest: QuoteRequestInterface,
    quoteResponse: QuoteResponseInterface,
    receiver: string
  ): Promise<void> {
    const { trade: trade } = await TransformUtils.transformCrossChain(
      quoteResponse,
      quoteRequest,
      quoteRequest.integratorAddress!,
      this.sdkLegacyService,
      this.rubicApiService
    );

    const tradeData: DepositTradeData = {
      trade,
      paymentInfo: null
    };

    if (trade instanceof CrossChainTransferTrade) {
      const paymentInfo = await trade.getTransferTrade(
        receiver,
        this.walletConnectorService?.address,
        true
      );

      // this._paymentInfo$.next(paymentInfo);
      tradeData.paymentInfo = paymentInfo;
    }

    this._currentTradeData$.next(tradeData);
  }

  private subscribeOnStatusUpdate(): void {
    const sub = this.depositTradeData$
      .pipe(
        filter(tradeData => !!tradeData?.trade),
        switchMap(tradeData =>
          interval(30_000).pipe(
            startWith(-1),
            switchMap(() =>
              combineLatest([
                of(tradeData.trade),
                this.getDepositSwapStatus(tradeData.trade.rubicId)
              ])
            ),
            tap(([trade, status]) => {
              if (status === CROSS_CHAIN_DEPOSIT_STATUS.FINISHED) {
                this.privateStatisticsService.saveAction(
                  'PRIVATE_CROSSCHAIN_SWAP',
                  'HOUDINI',
                  this.walletConnectorService.address,
                  trade.from.address,
                  trade.from.weiAmount.toFixed(),
                  trade.from.blockchain
                );
              }

              this._depositTradeStatus$.next(status);
            }),
            takeWhile(([_trade, status]) => status !== CROSS_CHAIN_DEPOSIT_STATUS.FINISHED)
          )
        )
      )
      .subscribe();

    this.subscriptions.push(sub);
  }

  private async getDepositSwapStatus(rubicId: string): Promise<CrossChainDepositStatus> {
    try {
      if (!rubicId) {
        throw new Error(`[HoudiniSwapService_getSwapStatus] Deposit id can't be undefined.`);
      }

      const response = await this.rubicApiService.fetchCrossChainTxStatusExtended(rubicId);

      return API_STATUS_TO_DEPOSIT_STATUS[response.status];
    } catch (err) {
      console.log(err);
      return CROSS_CHAIN_DEPOSIT_STATUS.WAITING;
    }
  }

  private async switchWalletChainIfNeeded(blockchain: BlockchainName): Promise<void> {
    if (!this.walletConnectorService.address || !blockchain) return Promise.resolve();

    if (blockchain !== this.walletConnectorService.network) {
      await this.walletConnectorService.switchChain(blockchain as EvmBlockchainName);
    }

    return Promise.resolve();
  }
}
