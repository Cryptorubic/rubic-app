import { Injectable } from '@angular/core';
import { TransactionReceipt } from 'web3-eth';
import { Subscription } from 'rxjs';
import { RecentTrade } from '../../../shared/models/my-trades/recent-trades.interface';
import { UiRecentTrade } from '../models/ui-recent-trade.interface';
import { AuthService } from '@app/core/services/auth/auth.service';
import { ScannerLinkPipe } from '../../../shared/pipes/scanner-link.pipe';
import ADDRESS_TYPE from '../../../shared/models/blockchain/address-type';
import { TuiNotification } from '@taiga-ui/core';
import { HeaderStore } from '@app/core/header/services/header.store';
import { Blockchain, BLOCKCHAINS } from '@app/shared/constants/blockchain/ui-blockchains';
import { ErrorsService } from '@app/core/errors/errors.service';
import { NotificationsService } from '@app/core/services/notifications/notifications.service';
import { TranslateService } from '@ngx-translate/core';
import { RecentTradesStoreService } from '@app/core/services/recent-trades/recent-trades-store.service';
import { BlockchainName, CrossChainTxStatus, Web3PublicSupportedBlockchain } from 'rubic-sdk';
import { RubicSdkService } from '@features/swaps/core/services/rubic-sdk-service/rubic-sdk.service';

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
    private readonly sdk: RubicSdkService
  ) {}

  public async getTradeData(trade: RecentTrade): Promise<UiRecentTrade> {
    const { srcTxHash, crossChainProviderType, fromToken, toToken, timestamp } = trade;
    const fromBlockchainInfo = this.getFullBlockchainInfo(trade.fromBlockchain);
    const toBlockchainInfo = this.getFullBlockchainInfo(trade.toBlockchain);
    const srcTxLink = this.scannerLinkPipe.transform(
      srcTxHash,
      trade.fromBlockchain,
      ADDRESS_TYPE.TRANSACTION
    );
    const uiTrade: UiRecentTrade = {
      fromBlockchain: fromBlockchainInfo,
      toBlockchain: toBlockchainInfo,
      fromToken,
      toToken,
      timestamp,
      srcTxLink,
      srcTxHash,
      crossChainProviderType
    };

    if (trade.calculatedStatusTo && trade.calculatedStatusFrom) {
      uiTrade.statusTo = trade.calculatedStatusTo;
      uiTrade.statusFrom = trade.calculatedStatusFrom;

      return uiTrade;
    }

    const { srcTxStatus, dstTxStatus } = await this.sdk.crossChainStatusManager.getCrossChainStatus(
      {
        fromBlockchain: trade.fromBlockchain as Web3PublicSupportedBlockchain, // @todo redo
        toBlockchain: trade.toBlockchain,
        srcTxHash: srcTxHash,
        txTimestamp: trade.timestamp,
        lifiBridgeType: trade.bridgeType,
        viaUuid: trade.viaUuid,
        rangoRequestId: trade.rangoRequestId
      },
      trade.crossChainProviderType
    );

    uiTrade.statusFrom = srcTxStatus;
    uiTrade.statusTo = dstTxStatus;

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
      transactionReceipt = await this.sdk.symbiosis.revertTrade(srcTxHash, {
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
        calculatedStatusFrom: CrossChainTxStatus.SUCCESS,
        calculatedStatusTo: CrossChainTxStatus.FALLBACK
      });
    } catch (error) {
      console.debug('[Symbiosis] Transaction revert error: ', error);
      this.errorService.catch(error);
    } finally {
      tradeInProgressSubscription$?.unsubscribe();
    }

    return transactionReceipt;
  }

  private getFullBlockchainInfo(blockchain: BlockchainName): Blockchain {
    return BLOCKCHAINS[blockchain];
  }

  public readAllTrades(): void {
    setTimeout(() => this.recentTradesStoreService.updateUnreadTrades(true), 0);
  }
}
