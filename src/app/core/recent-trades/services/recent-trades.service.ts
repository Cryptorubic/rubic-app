import { Inject, Injectable } from '@angular/core';
import { TransactionReceipt } from 'web3-eth';
import { of, Subscription } from 'rxjs';
import { RecentTrade } from '../../../shared/models/my-trades/recent-trades.interface';
import { UiRecentTrade } from '../models/ui-recent-trade.interface';
import { AuthService } from '@app/core/services/auth/auth.service';
import { CelerSwapStatus } from '@app/features/swaps/features/cross-chain-routing/services/cross-chain-routing-service/celer/models/celer-swap-status.enum';
import { CROSS_CHAIN_PROD } from 'src/environments/constants/cross-chain';
import { ScannerLinkPipe } from '../../../shared/pipes/scanner-link.pipe';
import ADDRESS_TYPE from '../../../shared/models/blockchain/address-type';
import { RecentTradeStatus } from '../models/recent-trade-status.enum';
import { decodeLogs } from '../../../shared/utils/decode-logs';
import { TuiDialogService, TuiNotification } from '@taiga-ui/core';
import { HeaderStore } from '@app/core/header/services/header.store';
import { Blockchain, BLOCKCHAINS } from '@app/shared/constants/blockchain/ui-blockchains';
import { ErrorsService } from '@app/core/errors/errors.service';
import { NotificationsService } from '@app/core/services/notifications/notifications.service';
import { TranslateService } from '@ngx-translate/core';
import { RecentTradesStoreService } from '@app/core/services/recent-trades/recent-trades-store.service';
import { RubicSwapStatus } from '@app/shared/models/swaps/rubic-swap-status.enum';
import { PROCESSED_TRANSACTION_METHOD_ABI } from '@app/shared/constants/common/processed-transaction-method-abi';
import { TransactionStuckError } from 'symbiosis-js-sdk';
import {
  BlockchainName,
  BlockchainsInfo,
  CROSS_CHAIN_TRADE_TYPE,
  CrossChainTradeType,
  Token,
  Web3Public
} from 'rubic-sdk';
import { Injector } from 'rubic-sdk/lib/core/sdk/injector';
import { celerContractAbi } from '@core/recent-trades/constants/celer-contract-abi';
import { celerContract } from '@core/recent-trades/constants/celer-contract-addresses';
import { RubicSdkService } from '@features/swaps/core/services/rubic-sdk-service/rubic-sdk.service';
import { HttpService } from '@core/services/http/http.service';
import { LifiSwapStatus } from '@shared/models/swaps/lifi-swap-status';
import { catchError } from 'rxjs/operators';

type SetupStatusFn = (
  trade: RecentTrade,
  uiTrade: UiRecentTrade,
  srcTransactionReceipt: TransactionReceipt,
  statusFrom: RecentTradeStatus
) => Promise<void>;

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
    @Inject(TuiDialogService) private readonly dialogService: TuiDialogService,
    private readonly sdk: RubicSdkService,
    private readonly httpService: HttpService
  ) {}

  public async getTradeData(trade: RecentTrade, type: CrossChainTradeType): Promise<UiRecentTrade> {
    const { srcTxHash, crossChainProviderType, fromToken, toToken, timestamp } = trade;
    const srcWeb3 = Injector.web3PublicService.getWeb3Public(trade.fromBlockchain);
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

    const srcTransactionReceipt = await this.getTxReceipt(srcTxHash, srcWeb3);
    const statusFrom = this.getSrcTxStatus(srcTransactionReceipt);

    uiTrade.statusFrom = statusFrom;

    const tradeFn: Record<CrossChainTradeType, SetupStatusFn> = {
      [CROSS_CHAIN_TRADE_TYPE.SYMBIOSIS]: this.setupSymbiosisStatuses,
      [CROSS_CHAIN_TRADE_TYPE.CELER]: this.setupCelerStatuses,
      [CROSS_CHAIN_TRADE_TYPE.RUBIC]: this.setupRubicStatuses,
      [CROSS_CHAIN_TRADE_TYPE.LIFI]: this.setupLifiStatuses
    };

    if (statusFrom === RecentTradeStatus.PENDING) {
      uiTrade.statusTo = RecentTradeStatus.PENDING;
    }

    if (statusFrom === RecentTradeStatus.FAIL) {
      uiTrade.statusTo = RecentTradeStatus.FAIL;
    }
    const setupTradesStatus = tradeFn[type];

    await setupTradesStatus(trade, uiTrade, srcTransactionReceipt, statusFrom);

    return uiTrade;
  }

  private async getTxReceipt(srcTxHash: string, web3: Web3Public): Promise<TransactionReceipt> {
    let receipt: TransactionReceipt;

    try {
      receipt = await web3.getTransactionReceipt(srcTxHash);
    } catch (error) {
      console.debug('[General] error retrieving src tx receipt', { error, srcTxHash });
      receipt = null;
    }

    return receipt;
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
        calculatedStatusFrom: RecentTradeStatus.SUCCESS,
        calculatedStatusTo: RecentTradeStatus.FALLBACK
      });
    } catch (error) {
      console.debug('[Symbiosis] Transaction revert error: ', error);
      this.errorService.catch(error);
    } finally {
      tradeInProgressSubscription$?.unsubscribe();
    }

    return transactionReceipt;
  }

  private getSrcTxStatus(receipt: TransactionReceipt): RecentTradeStatus {
    if (receipt === null) {
      return RecentTradeStatus.PENDING;
    }

    if (Boolean(receipt)) {
      if (receipt.status) {
        return RecentTradeStatus.SUCCESS;
      } else {
        return RecentTradeStatus.FAIL;
      }
    }
  }

  private getFullBlockchainInfo(blockchain: BlockchainName): Blockchain {
    return BLOCKCHAINS[blockchain];
  }

  public readAllTrades(): void {
    setTimeout(() => this.recentTradesStoreService.updateUnreadTrades(true), 0);
  }

  private setupLifiStatuses: SetupStatusFn = async (
    trade: RecentTrade,
    uiTrade: UiRecentTrade,
    srcTransactionReceipt: TransactionReceipt,
    statusFrom: RecentTradeStatus
  ) => {
    if (statusFrom === RecentTradeStatus.SUCCESS) {
      const bridgeType = trade?.bridgeType;
      if (!bridgeType) {
        uiTrade.statusTo = RecentTradeStatus.PENDING;
        return;
      }
      const requestParams = {
        bridge: trade.bridgeType,
        fromChain: BlockchainsInfo.getBlockchainByName(trade.fromBlockchain).id,
        toChain: BlockchainsInfo.getBlockchainByName(trade.toBlockchain).id,
        txHash: srcTransactionReceipt.transactionHash
      };
      const status = (
        await this.httpService
          .get<{ status: LifiSwapStatus }>('status', requestParams, 'https://li.quest/v1/')
          .pipe(
            catchError(() => {
              return of({ status: LifiSwapStatus.PENDING });
            })
          )
          .toPromise()
      ).status;

      if (status === LifiSwapStatus.DONE) {
        uiTrade.statusTo = RecentTradeStatus.SUCCESS;
        return;
      }
      if (status === LifiSwapStatus.FAILED) {
        uiTrade.statusTo = RecentTradeStatus.FAIL;
        return;
      }
      if (
        status === LifiSwapStatus.INVALID ||
        status === LifiSwapStatus.NOT_FOUND ||
        status === LifiSwapStatus.PENDING
      ) {
        uiTrade.statusTo = RecentTradeStatus.PENDING;
        return;
      }
    }
  };

  private setupSymbiosisStatuses: SetupStatusFn = async (
    trade: RecentTrade,
    uiTrade: UiRecentTrade,
    srcTransactionReceipt: TransactionReceipt,
    statusFrom: RecentTradeStatus
  ) => {
    const isAverageTxTimeSpent = Date.now() - trade.timestamp > 120000;
    if (statusFrom === RecentTradeStatus.SUCCESS) {
      if (!isAverageTxTimeSpent) {
        uiTrade.statusTo = RecentTradeStatus.PENDING;
      } else {
        try {
          const waitForCompleteResponse = this.sdk.symbiosis.waitForComplete(
            trade.fromBlockchain,
            trade.toBlockchain,
            trade.toToken as unknown as Token, // @TODO change types
            srcTransactionReceipt
          );

          if (waitForCompleteResponse) {
            console.debug('[Symbiosis] cross-chain completed', waitForCompleteResponse);
            uiTrade.statusTo = RecentTradeStatus.SUCCESS;
          }
        } catch (error) {
          console.debug('[Symbiosis] error retrieving tx status', error);
          if (error instanceof TransactionStuckError) {
            uiTrade.statusTo = RecentTradeStatus.REVERT;
          } else {
            uiTrade.statusTo = RecentTradeStatus.PENDING;
          }
        }
      }
    }
  };

  private setupCelerStatuses: SetupStatusFn = async (
    trade: RecentTrade,
    uiTrade: UiRecentTrade,
    srcTransactionReceipt: TransactionReceipt,
    statusFrom: RecentTradeStatus
  ) => {
    const dstWeb3 = Injector.web3PublicService.getWeb3Public(trade.toBlockchain);
    if (statusFrom === RecentTradeStatus.SUCCESS) {
      try {
        const [requestLog] = decodeLogs(celerContractAbi, srcTransactionReceipt).filter(Boolean); // filter undecoded logs
        const dstTransactionStatus = Number(
          await dstWeb3.callContractMethod(
            celerContract[trade.toBlockchain],
            celerContractAbi,
            'txStatusById',
            {
              methodArguments: [requestLog.params.find(param => param.name === 'id').value]
            }
          )
        ) as CelerSwapStatus;

        if (dstTransactionStatus === CelerSwapStatus.NULL) {
          uiTrade.statusTo = RecentTradeStatus.PENDING;
        }

        if (dstTransactionStatus === CelerSwapStatus.FAILED) {
          uiTrade.statusTo = RecentTradeStatus.FAIL;
        }

        if (dstTransactionStatus === CelerSwapStatus.SUCСESS) {
          uiTrade.statusTo = RecentTradeStatus.SUCCESS;
        }
      } catch (error) {
        console.debug('[Celer] error retrieving tx status', error);
        uiTrade.statusTo = RecentTradeStatus.PENDING;
      }
    }
  };

  private setupRubicStatuses: SetupStatusFn = async (
    trade: RecentTrade,
    uiTrade: UiRecentTrade,
    _srcTransactionReceipt: TransactionReceipt,
    statusFrom: RecentTradeStatus
  ) => {
    const dstWeb3 = Injector.web3PublicService.getWeb3Public(trade.toBlockchain);
    if (statusFrom === RecentTradeStatus.SUCCESS) {
      try {
        const statusTo = Number(
          await dstWeb3.callContractMethod(
            CROSS_CHAIN_PROD.contractAddresses[trade.toBlockchain],
            PROCESSED_TRANSACTION_METHOD_ABI,
            'processedTransactions',
            { methodArguments: [trade.srcTxHash] }
          )
        );

        if (statusTo === RubicSwapStatus.NULL) {
          uiTrade.statusTo = RecentTradeStatus.PENDING;
        }

        if (statusTo === RubicSwapStatus.PROCESSED) {
          uiTrade.statusTo = RecentTradeStatus.SUCCESS;
        }

        if (statusTo === RubicSwapStatus.REVERTED) {
          uiTrade.statusTo = RecentTradeStatus.FAIL;
        }
      } catch (error) {
        console.debug('[Rubic] Error retrieving tx status', error);
        uiTrade.statusTo = RecentTradeStatus.PENDING;
      }
    }
  };
}
