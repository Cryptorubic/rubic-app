import { Injectable } from '@angular/core';
import { TransactionReceipt } from 'web3-eth';
import { Subscription } from 'rxjs';
import { UiRecentTrade } from '../models/ui-recent-trade.interface';
import { AuthService } from '@app/core/services/auth/auth.service';
import { ScannerLinkPipe } from '@shared/pipes/scanner-link.pipe';
import ADDRESS_TYPE from '../../../shared/models/blockchain/address-type';
import { TuiNotification } from '@taiga-ui/core';
import { HeaderStore } from '@app/core/header/services/header.store';
import { ErrorsService } from '@app/core/errors/errors.service';
import { NotificationsService } from '@app/core/services/notifications/notifications.service';
import { TranslateService } from '@ngx-translate/core';
import { RecentTradesStoreService } from '@app/core/services/recent-trades/recent-trades-store.service';
import {
  ArbitrumRbcBridgeTrade,
  BLOCKCHAIN_NAME,
  BlockchainName,
  CbridgeCrossChainSupportedBlockchain,
  CROSS_CHAIN_TRADE_TYPE,
  CrossChainCbridgeManager,
  TX_STATUS,
  Web3PublicSupportedBlockchain,
  Web3Pure
} from 'rubic-sdk';
import { SdkService } from '@core/services/sdk/sdk.service';
import { RecentTrade } from '@shared/models/recent-trades/recent-trade';
import { isCrossChainRecentTrade } from '@shared/utils/recent-trades/is-cross-chain-recent-trade';
import { CrossChainRecentTrade } from '@shared/models/recent-trades/cross-chain-recent-trade';

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

  public async getTradeData(
    trade: RecentTrade,
    sourceUiTrade: UiRecentTrade
  ): Promise<UiRecentTrade> {
    const { srcTxHash, toToken, timestamp, dstTxHash: calculatedDstTxHash } = trade;
    const fromAssetType = isCrossChainRecentTrade(trade) ? trade.fromToken.blockchain : 'fiat';
    const fromAsset = isCrossChainRecentTrade(trade) ? trade.fromToken : trade.fromFiat;
    const toBlockchain = trade.toToken.blockchain;

    const fromAmount =
      isCrossChainRecentTrade(trade) && trade.fromAmount
        ? Web3Pure.fromWei(trade.fromAmount, trade.fromToken.decimals).toString()
        : '';
    const toAmount =
      isCrossChainRecentTrade(trade) && trade.toAmount
        ? Web3Pure.fromWei(trade.toAmount, trade.toToken.decimals).toString()
        : '';

    const srcBlockchain = isCrossChainRecentTrade(trade)
      ? trade.fromToken.blockchain
      : toBlockchain;
    const srcTxLink = srcTxHash
      ? this.scannerLinkPipe.transform(srcTxHash, srcBlockchain, ADDRESS_TYPE.TRANSACTION)
      : null;

    const uiTrade: UiRecentTrade = {
      fromAssetType,
      toBlockchain,
      fromAsset,
      toToken,
      timestamp,
      srcTxLink,
      srcTxHash,
      fromAmount,
      toAmount
    };

    if (calculatedDstTxHash) {
      uiTrade.dstTxHash = calculatedDstTxHash;
      uiTrade.dstTxLink = this.scannerLinkPipe.transform(
        calculatedDstTxHash,
        toBlockchain,
        ADDRESS_TYPE.TRANSACTION
      );
    }

    if (trade.calculatedStatusTo && trade.calculatedStatusFrom) {
      uiTrade.statusTo = trade.calculatedStatusTo;
      uiTrade.statusFrom = trade.calculatedStatusFrom;

      return uiTrade;
    }

    if (sourceUiTrade?.dstTxHash) {
      uiTrade.dstTxHash = sourceUiTrade?.dstTxHash;
      uiTrade.dstTxLink = sourceUiTrade?.dstTxLink;
    }

    if (isCrossChainRecentTrade(trade)) {
      return this.getCrossChainStatuses(trade, uiTrade);
    }
  }

  private async getCrossChainStatuses(
    trade: CrossChainRecentTrade,
    uiTrade: UiRecentTrade
  ): Promise<UiRecentTrade> {
    if (trade.crossChainTradeType === CROSS_CHAIN_TRADE_TYPE.BRIDGERS && !trade.amountOutMin) {
      console.debug('Field amountOutMin should be provided for BRIDGERS provider.');
    }

    const storageData = this.recentTradesStoreService.getSpecificCrossChainTrade(
      trade.srcTxHash,
      trade.fromToken.blockchain
    );

    const { srcTxStatus, dstTxStatus, dstTxHash } =
      await this.sdkService.crossChainStatusManager.getCrossChainStatus(
        {
          fromBlockchain: trade.fromToken.blockchain as Web3PublicSupportedBlockchain,
          toBlockchain: trade.toToken.blockchain,
          srcTxHash: uiTrade.srcTxHash,
          txTimestamp: trade.timestamp,
          lifiBridgeType: trade.bridgeType,
          viaUuid: trade.viaUuid,
          rangoRequestId: trade.rangoRequestId,
          amountOutMin: trade.amountOutMin,
          changenowId: trade.changenowId
        },
        trade.crossChainTradeType
      );

    uiTrade.statusFrom =
      storageData?.calculatedStatusFrom === TX_STATUS.SUCCESS ? TX_STATUS.SUCCESS : srcTxStatus;
    uiTrade.statusTo = dstTxStatus;
    uiTrade.dstTxHash = dstTxHash;
    uiTrade.dstTxLink = dstTxHash
      ? this.scannerLinkPipe.transform(dstTxHash, uiTrade.toBlockchain, ADDRESS_TYPE.TRANSACTION)
      : null;

    return uiTrade;
  }

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

      tradeInProgressSubscription$.unsubscribe();
      this.notificationsService.show(this.translateService.instant('bridgePage.successMessage'), {
        label: this.translateService.instant('notifications.successfulTradeTitle'),
        status: TuiNotification.Success,
        autoClose: 15000,
        data: null,
        icon: '',
        defaultAutoCloseTime: 0
      });

      this.recentTradesStoreService.updateTrade({
        ...this.recentTradesStoreService.getSpecificCrossChainTrade(
          srcTxHash,
          BLOCKCHAIN_NAME.ETHEREUM
        ),
        calculatedStatusFrom: TX_STATUS.SUCCESS,
        calculatedStatusTo: TX_STATUS.FALLBACK
      });
    } catch (error) {
      console.debug('[ArbitrumBridge] Transaction claim error: ', error);
      this.errorService.catch(error);
    } finally {
      tradeInProgressSubscription$?.unsubscribe();
    }

    return transactionReceipt;
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

      this.recentTradesStoreService.updateTrade({
        ...this.recentTradesStoreService.getSpecificCrossChainTrade(srcTxHash, fromBlockchain),
        calculatedStatusFrom: TX_STATUS.SUCCESS,
        calculatedStatusTo: TX_STATUS.FALLBACK
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

    const trade = this.recentTradesStoreService.getSpecificCrossChainTrade(
      srcTxHash,
      fromBlockchain
    );

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
        trade.amountOutMin,
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

      this.recentTradesStoreService.updateTrade({
        ...trade,
        calculatedStatusFrom: TX_STATUS.SUCCESS,
        calculatedStatusTo: TX_STATUS.FALLBACK
      });
    } catch (error) {
      console.debug('[Cbridge] Transaction revert error: ', error);
      this.errorService.catch(error);
    } finally {
      tradeInProgressSubscription$?.unsubscribe();
    }

    return transactionReceipt;
  }

  public async redeemArbitrum(
    srcTxHash: string,
    fromBlockchain: CbridgeCrossChainSupportedBlockchain
  ): Promise<TransactionReceipt> {
    let tradeInProgressSubscription$: Subscription;
    let transactionReceipt: TransactionReceipt;

    const trade = this.recentTradesStoreService.getSpecificCrossChainTrade(
      srcTxHash,
      fromBlockchain
    );

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

      this.recentTradesStoreService.updateTrade({
        ...trade,
        calculatedStatusFrom: TX_STATUS.SUCCESS,
        calculatedStatusTo: TX_STATUS.FALLBACK
      });
    } catch (error) {
      console.debug('[Cbridge] Transaction revert error: ', error);
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
