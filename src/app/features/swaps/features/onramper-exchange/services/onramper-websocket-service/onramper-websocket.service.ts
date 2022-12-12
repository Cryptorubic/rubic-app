import { Injectable } from '@angular/core';
import { AuthService } from '@core/services/auth/auth.service';
import { webSocket } from 'rxjs/webSocket';
import { switchMap, takeWhile } from 'rxjs/operators';
import { interval, of, Subscription } from 'rxjs';
import { OnramperTransactionInfo } from '@features/swaps/features/onramper-exchange/services/onramper-websocket-service/models/onramper-transaction-info';
import { OnramperTransactionStatus } from '@features/swaps/features/onramper-exchange/services/onramper-websocket-service/models/onramper-transaction-status';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { ProgressTrxNotificationComponent } from '@shared/components/progress-trx-notification/progress-trx-notification.component';
import { TuiNotification } from '@taiga-ui/core';
import { SuccessTrxNotificationComponent } from '@shared/components/success-trx-notification/success-trx-notification.component';
import {
  BlockchainName,
  EvmBlockchainName,
  EvmWeb3Pure,
  Injector,
  TxStatus,
  Web3Pure
} from 'rubic-sdk';
import { NotificationsService } from '@core/services/notifications/notifications.service';
import { OnramperService } from '@core/services/onramper/onramper.service';
import { OnramperFormService } from '@features/swaps/features/onramper-exchange/services/onramper-form-service/onramper-form.service';
import { RecentTradesStoreService } from '@core/services/recent-trades/recent-trades-store.service';
import { OnramperRecentTrade } from '@shared/models/recent-trades/onramper-recent-trade';
import { SwapFormInputFiats } from '@core/services/swaps/models/swap-form-fiats';
import BigNumber from 'bignumber.js';
import { OnramperFormCalculationService } from '@features/swaps/features/onramper-exchange/services/onramper-form-service/onramper-form-calculation.service';
import { SwapFormService } from '@core/services/swaps/swap-form.service';
import { TRADE_STATUS } from '@shared/models/swaps/trade-status';

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

  private intervalSubscription$: Subscription;

  constructor(
    private readonly authService: AuthService,
    private readonly notificationsService: NotificationsService,
    private readonly onramperFormService: OnramperFormService,
    private readonly onramperFormCalculationService: OnramperFormCalculationService,
    private readonly onramperService: OnramperService,
    private readonly recentTradesStoreService: RecentTradesStoreService,
    private readonly swapFormService: SwapFormService
  ) {
    this.subscribeOnUserChange();
    this.subscribeOnForm();
    this.subscribeOnWidgetOpened();
  }

  private subscribeOnUserChange(): void {
    this.authService.currentUser$
      .pipe(
        switchMap(user => {
          this.intervalSubscription$?.unsubscribe();

          if (!user?.address) {
            return of(null);
          }
          return webSocket<{ message: string }>(
            `wss://dev-api.rubic.exchange/ws/onramp/transactions_receiver/${user.address}`
          );
        }),
        switchMap(async event => {
          if (event && 'message' in event) {
            const txInfo: OnramperTransactionInfo = JSON.parse(event.message);
            if (txInfo?.status) {
              await this.parseTransactionInfo(txInfo);
            }
          }
        })
      )
      .subscribe();
  }

  private async parseTransactionInfo(txInfo: OnramperTransactionInfo): Promise<void> {
    if (txInfo?.status === OnramperTransactionStatus.PENDING) {
      if (this.inputForm) {
        this.progressNotificationSubscription$ = this.notificationsService.show(
          new PolymorpheusComponent(ProgressTrxNotificationComponent),
          {
            status: TuiNotification.Info,
            autoClose: false,
            data: { withRecentTrades: true }
          }
        );

        this.onramperFormService.widgetOpened = false;
        this.onramperFormCalculationService.tradeStatus = TRADE_STATUS.BUY_NATIVE_IN_PROGRESS;

        const recentTrade: OnramperRecentTrade = {
          fromFiat: this.inputForm.fromFiat,
          toToken: this.inputForm.toToken,

          txId: txInfo.transaction_id,

          timestamp: Date.now(),
          calculatedStatusTo: TxStatus.PENDING
        };
        this.recentTradesStoreService.saveTrade(this.authService.userAddress, recentTrade);

        await this.setupBalanceCheckTimer(
          txInfo.transaction_id,
          this.inputForm.toToken.blockchain,
          txInfo.out_amount
        );
      }
    } else if (txInfo?.status === OnramperTransactionStatus.COMPLETED) {
      await this.handleSuccessfulTrade(txInfo.transaction_id, txInfo.out_amount);
    }
  }

  private async setupBalanceCheckTimer(
    txId: string,
    blockchain: BlockchainName,
    outAmount: string
  ): Promise<void> {
    const userAddress = this.authService.userAddress;
    const minDiffAmount = new BigNumber(outAmount).multipliedBy(0.98);

    const getBalance = Injector.web3PublicService.getWeb3Public(
      blockchain as EvmBlockchainName
    ).getBalance;
    let balance = await getBalance(userAddress);

    this.intervalSubscription$ = interval(20_000)
      .pipe(
        switchMap(async () => {
          const updatedBalance = await getBalance(userAddress);
          const balanceDiff = Web3Pure.fromWei(updatedBalance.minus(balance));

          if (minDiffAmount.lte(balanceDiff)) {
            await this.handleSuccessfulTrade(txId, balanceDiff.toFixed());
            return true;
          }
          balance = updatedBalance;
          return false;
        }),
        takeWhile(stop => !stop)
      )
      .subscribe();
  }

  private async handleSuccessfulTrade(txId: string, nativeAmount: string): Promise<void> {
    const recentTrade = this.recentTradesStoreService.getSpecificOnramperTrade(txId);
    if (!recentTrade || recentTrade.calculatedStatusFrom === TxStatus.SUCCESS) {
      return;
    }
    this.recentTradesStoreService.updateTrade({
      ...recentTrade,
      calculatedStatusFrom: TxStatus.SUCCESS,
      nativeAmount: nativeAmount
    });

    this.progressNotificationSubscription$?.unsubscribe();
    this.notificationsService.show(new PolymorpheusComponent(SuccessTrxNotificationComponent), {
      status: TuiNotification.Success,
      autoClose: 15000,
      data: { type: 'on-chain', withRecentTrades: true }
    });

    this.onramperFormCalculationService.tradeStatus = TRADE_STATUS.READY_TO_BUY_NATIVE;
    this.onramperFormCalculationService.updateRate();

    if (this.relocateToOnChain) {
      if (!EvmWeb3Pure.isNativeAddress(this.inputForm.toToken.address)) {
        await this.onramperService.updateSwapFormByRecentTrade(txId);
      }
    }
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
}
