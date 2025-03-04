import { Injectable } from '@angular/core';
import { BehaviorSubject, Subscription, firstValueFrom } from 'rxjs';
import { TransactionReceipt } from 'web3-core';
import { TuiNotification } from '@taiga-ui/core';
import {
  ArbitrumRbcBridgeTrade,
  CbridgeCrossChainSupportedBlockchain,
  CrossChainCbridgeManager
} from 'rubic-sdk';
import { NotificationsService } from '@core/services/notifications/notifications.service';
import { TranslateService } from '@ngx-translate/core';
import { SdkService } from '@core/services/sdk/sdk.service';
import { ErrorsService } from '@core/errors/errors.service';
import { HttpService } from '@app/core/services/http/http.service';
import { getSignature } from '@app/shared/utils/get-signature';

@Injectable()
export class CommonTableService {
  private readonly _activeItemIndex$ = new BehaviorSubject<0 | 1 | 2>(0);

  public readonly activeItemIndex$ = this._activeItemIndex$.asObservable();

  public set activeItemIndex(value: 0 | 1 | 2) {
    this._activeItemIndex$.next(value);
  }

  constructor(
    private readonly errorService: ErrorsService,
    private readonly notificationsService: NotificationsService,
    private readonly translateService: TranslateService,
    private readonly sdkService: SdkService,
    private readonly http: HttpService
  ) {}

  public async claimArbitrumBridgeTokens(srcTxHash: string): Promise<TransactionReceipt> {
    let tradeInProgressSubscription$: Subscription;
    let transactionReceipt: TransactionReceipt;
    const onTransactionHash = () => {
      tradeInProgressSubscription$ = this.notificationsService.show(
        this.translateService.instant('bridgePage.progressMessage'),
        {
          label: this.translateService.instant('notifications.tradeInProgress'),
          status: TuiNotification.Info,
          autoClose: false,
          data: null,
          icon: '',
          defaultAutoCloseTime: 0
        }
      );
    };

    try {
      transactionReceipt = await ArbitrumRbcBridgeTrade.claimTargetTokens(srcTxHash, {
        onConfirm: onTransactionHash
      });

      await this.sendHashesOnClaimSuccess(srcTxHash, transactionReceipt.transactionHash);
      tradeInProgressSubscription$.unsubscribe();
      this.notificationsService.show(this.translateService.instant('bridgePage.successMessage'), {
        label: this.translateService.instant('notifications.successfulTradeTitle'),
        status: TuiNotification.Success,
        autoClose: 15000,
        data: null,
        icon: '',
        defaultAutoCloseTime: 0
      });
    } catch (error) {
      console.debug('[ArbitrumBridge] Transaction claim error: ', error);
      this.errorService.catch(error);
    } finally {
      tradeInProgressSubscription$?.unsubscribe();
    }

    return transactionReceipt;
  }

  private async sendHashesOnClaimSuccess(
    srcTxHash: string,
    destTxHash: string
  ): Promise<{ detail: string }> {
    return firstValueFrom(
      this.http.post<{ detail: string }>(
        'v2/trades/crosschain/rbc_arbitrum_bridge',
        {
          source_tx_hash: srcTxHash,
          dest_tx_hash: destTxHash
        },
        null,
        {
          headers: {
            Signature: getSignature(destTxHash.toLowerCase(), srcTxHash.toLowerCase())
          }
        }
      )
    );
  }

  public async revertSymbiosis(srcTxHash: string): Promise<TransactionReceipt> {
    let tradeInProgressSubscription$: Subscription;
    let transactionReceipt: TransactionReceipt;
    const onTransactionHash = () => {
      tradeInProgressSubscription$ = this.notificationsService.show(
        this.translateService.instant('bridgePage.progressMessage'),
        {
          label: this.translateService.instant('notifications.tradeInProgress'),
          status: TuiNotification.Info,
          autoClose: false,
          data: null,
          icon: '',
          defaultAutoCloseTime: 0
        }
      );
    };

    try {
      transactionReceipt = await this.sdkService.symbiosis.revertTrade(srcTxHash, {
        onConfirm: onTransactionHash
      });

      tradeInProgressSubscription$.unsubscribe();
      this.notificationsService.show(this.translateService.instant('bridgePage.successMessage'), {
        label: this.translateService.instant('notifications.successfulTradeTitle'),
        status: TuiNotification.Success,
        autoClose: 15000,
        data: null,
        icon: '',
        defaultAutoCloseTime: 0
      });
    } catch (error) {
      console.debug('[Symbiosis] Transaction revert error: ', error);
      this.errorService.catch(error);
    } finally {
      tradeInProgressSubscription$?.unsubscribe();
    }

    return transactionReceipt;
  }

  public async revertCbridge(
    srcTxHash: string,
    fromBlockchain: CbridgeCrossChainSupportedBlockchain
  ): Promise<TransactionReceipt> {
    let tradeInProgressSubscription$: Subscription;
    let transactionReceipt: TransactionReceipt;

    // const trade = this.recentTradesStoreService.getSpecificCrossChainTrade(
    //   srcTxHash,
    //   fromBlockchain
    // );

    const onTransactionHash = () => {
      tradeInProgressSubscription$ = this.notificationsService.show(
        this.translateService.instant('bridgePage.progressMessage'),
        {
          label: this.translateService.instant('notifications.tradeInProgress'),
          status: TuiNotification.Info,
          autoClose: false,
          data: null,
          icon: '',
          defaultAutoCloseTime: 0
        }
      );
    };

    try {
      transactionReceipt = await CrossChainCbridgeManager.makeRefund(
        fromBlockchain,
        srcTxHash,
        '', // trade.amountOutMin,
        onTransactionHash
      );
      tradeInProgressSubscription$.unsubscribe();
      this.notificationsService.show(this.translateService.instant('bridgePage.successMessage'), {
        label: this.translateService.instant('notifications.successfulTradeTitle'),
        status: TuiNotification.Success,
        autoClose: 15000,
        data: null,
        icon: '',
        defaultAutoCloseTime: 0
      });
    } catch (error) {
      console.debug('[Cbridge] Transaction revert error: ', error);
      this.errorService.catch(error);
    } finally {
      tradeInProgressSubscription$?.unsubscribe();
    }

    return transactionReceipt;
  }

  public async redeemArbitrum(srcTxHash: string): Promise<TransactionReceipt> {
    let tradeInProgressSubscription$: Subscription;
    let transactionReceipt: TransactionReceipt;

    const onTransactionHash = () => {
      tradeInProgressSubscription$ = this.notificationsService.show(
        this.translateService.instant('bridgePage.progressMessage'),
        {
          label: this.translateService.instant('notifications.tradeInProgress'),
          status: TuiNotification.Info,
          autoClose: false,
          data: null,
          icon: '',
          defaultAutoCloseTime: 0
        }
      );
    };

    try {
      transactionReceipt = await ArbitrumRbcBridgeTrade.redeemTokens(srcTxHash, {
        onConfirm: onTransactionHash
      });
      tradeInProgressSubscription$.unsubscribe();
      this.notificationsService.show(this.translateService.instant('bridgePage.successMessage'), {
        label: this.translateService.instant('notifications.successfulTradeTitle'),
        status: TuiNotification.Success,
        autoClose: 15000,
        data: null,
        icon: '',
        defaultAutoCloseTime: 0
      });
    } catch (error) {
      console.debug('[Cbridge] Transaction revert error: ', error);
      this.errorService.catch(error);
    } finally {
      tradeInProgressSubscription$?.unsubscribe();
    }

    return transactionReceipt;
  }
}
