import { Injectable } from '@angular/core';
import { TransactionReceipt } from 'web3-eth';
import { Subscription } from 'rxjs';
import { UiRecentTrade } from '../models/ui-recent-trade.interface';
import { AuthService } from '@app/core/services/auth/auth.service';
import { ScannerLinkPipe } from '@shared/pipes/scanner-link.pipe';
import ADDRESS_TYPE from '../../../shared/models/blockchain/address-type';
import { TuiNotification } from '@taiga-ui/core';
import { HeaderStore } from '@app/core/header/services/header.store';
import { BLOCKCHAINS } from '@app/shared/constants/blockchain/ui-blockchains';
import { ErrorsService } from '@app/core/errors/errors.service';
import { NotificationsService } from '@app/core/services/notifications/notifications.service';
import { TranslateService } from '@ngx-translate/core';
import { RecentTradesStoreService } from '@app/core/services/recent-trades/recent-trades-store.service';
import {
  BlockchainName,
  CROSS_CHAIN_TRADE_TYPE,
  TxStatus,
  Web3PublicSupportedBlockchain
} from 'rubic-sdk';
import { SdkService } from '@core/services/sdk/sdk.service';
import { RecentTrade } from '@shared/models/recent-trades/recent-trade';

@Injectable()
export class RecentTradesService {
  public get recentTrades(): RecentTrade[] {
    return this.recentTradesStoreService.currentUserRecentTrades;
  }

  public get userAddress(): string {
    return this.authService.userAddress;
  }

  public get isMobile(): boolean {
    return this.headerStoreService.isMobile;
  }

  constructor(
    private readonly authService: AuthService,
    private readonly scannerLinkPipe: ScannerLinkPipe,
    private readonly headerStoreService: HeaderStore,
    private readonly errorService: ErrorsService,
    private readonly notificationsService: NotificationsService,
    private readonly translateService: TranslateService,
    private readonly recentTradesStoreService: RecentTradesStoreService,
    private readonly sdkService: SdkService
  ) {}

  public async getTradeData(trade: RecentTrade): Promise<UiRecentTrade> {
    const { srcTxHash, fromToken, toToken, timestamp, dstTxHash: calculatedDstTxHash } = trade;
    const fromBlockchainInfo = BLOCKCHAINS[trade.fromToken.blockchain];
    const toBlockchainInfo = BLOCKCHAINS[trade.toToken.blockchain];
    const srcTxLink = this.scannerLinkPipe.transform(
      srcTxHash,
      trade.fromToken.blockchain,
      ADDRESS_TYPE.TRANSACTION
    );
    const uiTrade: UiRecentTrade = {
      fromBlockchain: fromBlockchainInfo,
      toBlockchain: toBlockchainInfo,
      fromToken,
      toToken,
      timestamp,
      srcTxLink,
      srcTxHash
    };

    if (calculatedDstTxHash) {
      uiTrade.dstTxHash = calculatedDstTxHash;
      uiTrade.dstTxLink = this.scannerLinkPipe.transform(
        calculatedDstTxHash,
        toBlockchainInfo.key,
        ADDRESS_TYPE.TRANSACTION
      );
    }

    if (trade.calculatedStatusTo && trade.calculatedStatusFrom) {
      uiTrade.statusTo = trade.calculatedStatusTo;
      uiTrade.statusFrom = trade.calculatedStatusFrom;

      return uiTrade;
    }

    if (trade.crossChainTradeType === CROSS_CHAIN_TRADE_TYPE.BRIDGERS && !trade.amountOutMin) {
      console.debug('Field amountOutMin should be provided for BRIDGERS provider.');
    }

    const { srcTxStatus, dstTxStatus, dstTxHash } =
      await this.sdkService.crossChainStatusManager.getCrossChainStatus(
        {
          fromBlockchain: trade.fromToken.blockchain as Web3PublicSupportedBlockchain,
          toBlockchain: trade.toToken.blockchain,
          srcTxHash: srcTxHash,
          txTimestamp: trade.timestamp,
          lifiBridgeType: trade.bridgeType,
          viaUuid: trade.viaUuid,
          rangoRequestId: trade.rangoRequestId,
          amountOutMin: trade.amountOutMin
        },
        trade.crossChainTradeType
      );

    uiTrade.statusFrom = srcTxStatus;
    uiTrade.statusTo = dstTxStatus;
    uiTrade.dstTxHash = dstTxHash;
    uiTrade.dstTxLink = dstTxHash
      ? new ScannerLinkPipe().transform(dstTxHash, toBlockchainInfo.key, ADDRESS_TYPE.TRANSACTION)
      : null;

    return uiTrade;
  }

  public async revertSymbiosis(
    srcTxHash: string,
    fromBlockchain: BlockchainName
  ): Promise<TransactionReceipt> {
    let tradeInProgressSubscription$: Subscription;
    let transactionReceipt: TransactionReceipt;
    const onTransactionHash = () => {
      tradeInProgressSubscription$ = this.notificationsService.show(
        this.translateService.instant('bridgePage.progressMessage'),
        {
          label: this.translateService.instant('notifications.tradeInProgress'),
          status: TuiNotification.Info,
          autoClose: false
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
        autoClose: 15000
      });

      this.recentTradesStoreService.updateTrade({
        ...this.recentTradesStoreService.getSpecificTrade(srcTxHash, fromBlockchain),
        calculatedStatusFrom: TxStatus.SUCCESS,
        calculatedStatusTo: TxStatus.FALLBACK
      });
    } catch (error) {
      console.debug('[Symbiosis] Transaction revert error: ', error);
      this.errorService.catch(error);
    } finally {
      tradeInProgressSubscription$?.unsubscribe();
    }

    return transactionReceipt;
  }

  public readAllTrades(): void {
    setTimeout(() => this.recentTradesStoreService.updateUnreadTrades(true), 0);
  }
}
