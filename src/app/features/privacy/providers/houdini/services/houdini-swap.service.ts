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
  EvmBlockchainName
} from '@cryptorubic/core';
import { Token as SharedToken } from '@app/shared/models/tokens/token';
import { RubicSdkError } from '@cryptorubic/web3';
import BigNumber from 'bignumber.js';
import { BehaviorSubject } from 'rxjs';
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

@Injectable()
export class HoudiniSwapService {
  private readonly _latestQuoteRequest$ = new BehaviorSubject<QuoteRequestInterface | null>(null);

  private readonly _latestQuoteResponse$ = new BehaviorSubject<QuoteResponseInterface | null>(null);

  public get latestQuoteRequest(): QuoteRequestInterface {
    return this._latestQuoteRequest$.value;
  }

  public get latestQuoteResponse(): QuoteResponseInterface {
    return this._latestQuoteResponse$.value;
  }

  constructor(
    private readonly rubicApiService: RubicApiService,
    private readonly sdkLegacyService: SdkLegacyService,
    private readonly notificationsService: NotificationsService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly crossChainService: CrossChainService,
    private readonly privateSwapWindowService: PrivateSwapWindowService,
    private readonly settingsService: SettingsService,
    private readonly houdiniErrorService: HoudiniErrorService
  ) {}

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
    const quoteRequest: QuoteRequestInterface = {
      srcTokenBlockchain: fromToken.blockchain,
      srcTokenAddress: fromToken.address,
      srcTokenAmount: fromToken.tokenAmount.toString(),
      dstTokenBlockchain: toToken.blockchain,
      dstTokenAddress: toToken.address,
      preferredProvider: 'houdini',
      fromAddress: this.walletConnectorService.address,
      receiver,
      showDangerousRoutes: true
    };

    try {
      const quoteResponse = await this.rubicApiService.fetchBestQuote(quoteRequest);
      // const route = quoteResponse?.routes[0];
      if (quoteResponse) {
        this.filterHoudiniSlippageWarning(quoteResponse);

        this._latestQuoteRequest$.next(quoteRequest);
        this._latestQuoteResponse$.next(quoteResponse);

        return {
          tradeId: quoteResponse.id,
          tokenAmount: quoteResponse.estimate.destinationTokenAmount,
          tokenAmountWei: new BigNumber(quoteResponse.estimate.destinationWeiAmount)
        };
      }
    } catch (err) {
      return this.parseQuoteError(err);
    }
  }

  public async swap(fromToken: TokenAmount<BlockchainName>): Promise<void> {
    try {
      const trade = await this.getTrade();

      if (fromToken.blockchain !== this.walletConnectorService.network) {
        await this.walletConnectorService.switchChain(fromToken.blockchain as EvmBlockchainName);
      }

      //TODO: maybe add some callback later
      const approveCallback = {
        onHash: (_: string) => {},
        onSwap: (..._: unknown[]) => {},
        onError: () => {}
      };

      const swapCallback = {
        onHash: (_: string) => {},
        onSwap: () => {
          this.notificationsService.showSuccess('The operation was successful.');
        },
        onError: (_: RubicError<ERROR_TYPE> | null) => {},
        onSimulationSuccess: () => Promise.resolve<boolean>(true),
        onRateChange: (_: RateChangeInfo) => Promise.resolve<boolean>(true)
      };

      await this.handleApprove(trade, approveCallback);

      await this.handleSwap(trade, true, swapCallback);
    } catch (err) {
      this.showSwapError(err);
    }
  }

  public async getTrade(): Promise<CrossChainTrade> {
    const { trade: trade } = await TransformUtils.transformCrossChain(
      this.latestQuoteResponse,
      this.latestQuoteRequest,
      this.latestQuoteRequest.integratorAddress!,
      this.sdkLegacyService,
      this.rubicApiService
    );

    return trade;
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
      const isEqulaFromAmount = this.checkIsEqualFromAmount(trade.from.tokenAmount);
      if (!isEqulaFromAmount) {
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
        callback.onSimulationSuccess
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
                useCacheData: true
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
    if (error.message.includes('No routes found.')) {
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
      this.houdiniErrorService.setTradeError({ reason: 'Insufficient funds' });
    }
    if (error instanceof InsufficientGasError) {
      this.notificationsService.showError('Insufficient gas.');
      this.houdiniErrorService.setTradeError({ reason: 'Insufficient gas' });
    }
    console.error(error);
  }
}
