import { Injectable } from '@angular/core';
import { AuthService } from '@core/services/auth/auth.service';
import { webSocket } from 'rxjs/webSocket';
import { catchError, debounceTime, switchMap } from 'rxjs/operators';
import { from, of, Subscription } from 'rxjs';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { ProgressTrxNotificationComponent } from '@shared/components/progress-trx-notification/progress-trx-notification.component';
import { TuiNotification } from '@taiga-ui/core';
import { SuccessTrxNotificationComponent } from '@shared/components/success-trx-notification/success-trx-notification.component';
import { EvmWeb3Pure, TxStatus } from 'rubic-sdk';
import { NotificationsService } from '@core/services/notifications/notifications.service';
import { OnramperService } from '@core/services/onramper/onramper.service';
import { RecentTradesStoreService } from '@core/services/recent-trades/recent-trades-store.service';
import { OnramperRecentTrade } from '@shared/models/recent-trades/onramper-recent-trade';
import { SwapFormInputFiats } from '@core/services/swaps/models/swap-form-fiats';
import { SwapFormService } from '@core/services/swaps/swap-form.service';
import { TRADE_STATUS } from '@shared/models/swaps/trade-status';
import { isOnramperRecentTrade } from '@shared/utils/recent-trades/is-onramper-recent-trade';
import { OnramperApiService } from '@core/services/backend/onramper-api/onramper-api.service';
import { IframeService } from '@core/services/iframe/iframe.service';
import { ENVIRONMENT } from 'src/environments/environment';
import { OnramperFormService } from '@features/swaps/features/onramper-exchange/services/onramper-form.service';
import { OnramperFormCalculationService } from '@features/swaps/features/onramper-exchange/services/onramper-form-calculation.service';
import { OnramperTransactionStatus } from '@features/swaps/features/onramper-exchange/models/onramper-transaction-status';
import { OnramperTransactionInfo } from '@features/swaps/features/onramper-exchange/models/onramper-transaction-info';
import { switchTap } from '@shared/utils/utils';

const websocketBaseUrl = ENVIRONMENT.websocketBaseUrl;

@Injectable()
export class OnramperWebsocketService {
  private progressNotificationSubscription$: Subscription;

  /**
   * If true, then form will be relocated to on-chain, after
   * native is bought through onramper.
   */
  private relocateToOnChain = false;

  /**
   * Stores form, which was used for onramper swap.
   */
  private inputForm: SwapFormInputFiats;

  private currentRecentTrade: OnramperRecentTrade;

  constructor(
    private readonly authService: AuthService,
    private readonly notificationsService: NotificationsService,
    private readonly onramperFormService: OnramperFormService,
    private readonly onramperFormCalculationService: OnramperFormCalculationService,
    private readonly onramperService: OnramperService,
    private readonly recentTradesStoreService: RecentTradesStoreService,
    private readonly swapFormService: SwapFormService,
    private readonly onramperApiService: OnramperApiService,
    private readonly iframeService: IframeService
  ) {
    this.subscribeOnUserChange();
    this.subscribeOnForm();
    this.subscribeOnWidgetOpened();
  }

  private async checkTradeStatus(): Promise<void> {
    if (this.iframeService.isIframe) {
      return;
    }

    const pendingTrades = this.recentTradesStoreService.currentUserRecentTrades.filter(
      trade => isOnramperRecentTrade(trade) && trade.calculatedStatusFrom === TxStatus.PENDING
    ) as OnramperRecentTrade[];

    const promises = pendingTrades.map(trade => {
      return this.onramperApiService
        .getTradeData(this.authService.userAddress, trade.txId)
        .then(tradeApiData => {
          if (
            tradeApiData.status === OnramperTransactionStatus.COMPLETED ||
            tradeApiData.status === OnramperTransactionStatus.FAILED
          ) {
            this.recentTradesStoreService.updateTrade({
              ...trade,
              calculatedStatusFrom:
                tradeApiData.status === OnramperTransactionStatus.COMPLETED
                  ? TxStatus.SUCCESS
                  : TxStatus.FAIL,
              nativeAmount: tradeApiData.out_amount
            });
          }
        });
    });
    await Promise.all(promises);
  }

  private subscribeOnUserChange(): void {
    this.authService.currentUser$
      .pipe(
        switchTap(() => from(this.checkTradeStatus()).pipe(catchError(() => of(null)))),
        switchMap(user => {
          if (!user?.address) {
            return of(null);
          }
          return webSocket<{ message: string }>(
            `${websocketBaseUrl}/onramp/transactions_receiver/${user.address}`
          );
        }),
        debounceTime(5_000),
        switchMap(event => {
          if (event && 'message' in event) {
            const txInfo: OnramperTransactionInfo = JSON.parse(event.message);
            if (txInfo?.status) {
              return this.parseTransactionInfo(txInfo);
            }
          }
          return of(null);
        }),
        catchError(err => {
          console.debug(err);
          return of(null);
        })
      )
      .subscribe();
  }

  private async parseTransactionInfo(txInfo: OnramperTransactionInfo): Promise<void> {
    if (txInfo?.status === OnramperTransactionStatus.PENDING) {
      await this.handlePendingTrade(txInfo);
    } else if (txInfo?.status === OnramperTransactionStatus.COMPLETED) {
      await this.handleSuccessfulTrade(txInfo);
    } else if (txInfo?.status === OnramperTransactionStatus.FAILED) {
      this.handleErrorTrade(txInfo);
    }
  }

  private async handleSuccessfulTrade(txInfo: OnramperTransactionInfo): Promise<void> {
    const { out_amount: nativeAmount, additional_info } = txInfo;
    const { isDirect, id } = JSON.parse(additional_info) as { isDirect: boolean; id: string };
    const recentTrade = !this.iframeService.isIframe
      ? this.recentTradesStoreService.getSpecificOnramperTrade(id)
      : this.currentRecentTrade;

    if (
      !recentTrade ||
      recentTrade.rubicId !== id ||
      recentTrade.calculatedStatusFrom === TxStatus.SUCCESS
    ) {
      return;
    }

    const updatedRecentTrade: OnramperRecentTrade = {
      ...recentTrade,
      calculatedStatusFrom: TxStatus.SUCCESS,
      nativeAmount: nativeAmount,
      ...(isDirect && { calculatedStatusTo: TxStatus.SUCCESS })
    };

    if (!this.iframeService.isIframe) {
      this.recentTradesStoreService.updateTrade(updatedRecentTrade);
    }

    this.currentRecentTrade = updatedRecentTrade;
    this.progressNotificationSubscription$?.unsubscribe();
    this.notificationsService.show(new PolymorpheusComponent(SuccessTrxNotificationComponent), {
      status: TuiNotification.Success,
      autoClose: 15000,
      data: { type: 'on-chain', withRecentTrades: true }
    });

    this.onramperFormCalculationService.stopBuyNativeInProgress();
    this.onramperFormCalculationService.updateRate();

    if (
      (this.iframeService.isIframe || this.relocateToOnChain) &&
      !EvmWeb3Pure.isNativeAddress(this.inputForm.toToken.address)
    ) {
      await this.onramperService.updateSwapFormByRecentTrade(id);
    }
  }

  private notifyProgress(): void {
    this.progressNotificationSubscription$ = this.notificationsService.show(
      new PolymorpheusComponent(ProgressTrxNotificationComponent),
      {
        status: TuiNotification.Info,
        autoClose: false,
        data: { withRecentTrades: true }
      }
    );
  }

  private subscribeOnForm(): void {
    this.swapFormService.inputValueDistinct$.subscribe(() => {
      this.relocateToOnChain = false;
    });
  }

  private subscribeOnWidgetOpened(): void {
    this.onramperFormService.widgetOpened$.subscribe(opened => {
      if (opened) {
        this.relocateToOnChain = true;
        this.inputForm = this.onramperFormCalculationService.inputValue;
      }
    });
  }

  private async handlePendingTrade(txInfo: OnramperTransactionInfo): Promise<void> {
    const { additional_info } = txInfo;
    const { id, isDirect } = JSON.parse(additional_info) as { isDirect: boolean; id: string };

    const recentTrade = this.iframeService.isIframe
      ? null
      : this.recentTradesStoreService.getSpecificOnramperTrade(id);

    if (this.inputForm && !recentTrade) {
      this.notifyProgress();

      this.onramperFormService.widgetOpened = false;
      this.onramperFormCalculationService.tradeStatus = TRADE_STATUS.BUY_NATIVE_IN_PROGRESS;

      this.currentRecentTrade = {
        fromFiat: this.inputForm.fromFiat,
        toToken: this.inputForm.toToken,

        nativeAmount: txInfo.out_amount,
        rubicId: id,
        txId: txInfo.transaction_id,

        timestamp: Date.now(),
        calculatedStatusFrom: TxStatus.PENDING,
        isDirect
      };
      if (!this.iframeService.isIframe) {
        this.recentTradesStoreService.saveTrade(
          this.authService.userAddress,
          this.currentRecentTrade
        );
      }
    }
  }

  private handleErrorTrade(txInfo: OnramperTransactionInfo): void {
    const { id } = JSON.parse(txInfo.additional_info);
    const recentTrade = this.recentTradesStoreService.getSpecificOnramperTrade(id);
    if (!this.iframeService.isIframe) {
      this.recentTradesStoreService.updateTrade(recentTrade);
    }

    this.progressNotificationSubscription$?.unsubscribe();

    this.onramperFormCalculationService.stopBuyNativeInProgress();
    this.onramperFormCalculationService.updateRate();
  }
}
