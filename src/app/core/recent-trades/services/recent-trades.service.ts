import { Inject, Injectable } from '@angular/core';
import { TransactionReceipt } from 'web3-eth';
import { EthLikeWeb3Public } from 'src/app/core/services/blockchain/blockchain-adapters/eth-like/web3-public/eth-like-web3-public';
import { PublicBlockchainAdapterService } from '@app/core/services/blockchain/blockchain-adapters/public-blockchain-adapter.service';
import { BehaviorSubject, from, interval, Observable, Subject, Subscription } from 'rxjs';
import { tap, switchMap, startWith, map } from 'rxjs/operators';
import { RecentTrade } from '../../../shared/models/my-trades/recent-trades.interface';
import { UiRecentTrade } from '../models/ui-recent-trade.interface';
import { AuthService } from '@app/core/services/auth/auth.service';
import { CELER_CONTRACT_ABI } from '@app/features/swaps/features/cross-chain-routing/services/cross-chain-routing-service/celer/constants/CELER_CONTRACT_ABI';
import { CELER_CONTRACT } from '@app/features/swaps/features/cross-chain-routing/services/cross-chain-routing-service/celer/constants/CELER_CONTRACT';
import {
  BlockchainName,
  EthLikeBlockchainName
} from '../../../shared/models/blockchain/blockchain-name';
import { CelerSwapStatus } from '@app/features/swaps/features/cross-chain-routing/services/cross-chain-routing-service/celer/models/celer-swap-status.enum';
import { CROSS_CHAIN_PROD } from 'src/environments/constants/cross-chain';
import { CROSS_CHAIN_PROVIDER } from '@app/features/swaps/features/cross-chain-routing/services/cross-chain-routing-service/models/cross-chain-trade';
import { ScannerLinkPipe } from '../../../shared/pipes/scanner-link.pipe';
import ADDRESS_TYPE from '../../../shared/models/blockchain/address-type';
import { RecentTradeStatus } from '../models/recent-trade-status.enum';
import { decodeLogs } from '../../../shared/utils/decode-logs';
import { TuiDialogService, TuiNotification } from '@taiga-ui/core';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { RecentCrosschainTxComponent } from '../components/recent-crosschain-tx/recent-crosschain-tx.component';
import { HeaderStore } from '@app/core/header/services/header.store';
import { Blockchain, BLOCKCHAINS } from '@app/features/my-trades/constants/blockchains';
import { asyncMap } from '@shared/utils/utils';
import { SymbiosisService } from '@app/core/services/symbiosis/symbiosis.service';
import { ErrorsService } from '@app/core/errors/errors.service';
import { NotificationsService } from '@app/core/services/notifications/notifications.service';
import { TranslateService } from '@ngx-translate/core';
import { RecentTradesStoreService } from '@app/core/services/recent-trades/recent-trades-store.service';
import { PendingRequest } from 'symbiosis-js-sdk';
import { RubicSwapStatus } from '@app/shared/models/swaps/rubic-swap-status.enum';
import { PROCESSED_TRANSACTION_METHOD_ABI } from '@app/shared/constants/common/processed-transaction-method-abi';

@Injectable()
export class RecentTradesService {
  private get recentTrades(): RecentTrade[] {
    return this.recentTradesStoreService.currentUserRecentTrades;
  }

  public get userAddress(): string {
    return this.authService.userAddress;
  }

  public get isMobile(): boolean {
    return this.headerStoreService.isMobile;
  }

  private readonly _usersTrades$ = new BehaviorSubject<UiRecentTrade[]>(undefined);

  public readonly usersTrades$ = this._usersTrades$.asObservable();

  private readonly _forceReload$ = new Subject<boolean>();

  private symbiosisPendingRequests: PendingRequest[];

  constructor(
    private readonly web3Public: PublicBlockchainAdapterService,
    private readonly authService: AuthService,
    private readonly scannerLinkPipe: ScannerLinkPipe,
    private readonly headerStoreService: HeaderStore,
    private readonly symbiosisService: SymbiosisService,
    private readonly errorService: ErrorsService,
    private readonly notificationsService: NotificationsService,
    private readonly translateService: TranslateService,
    private readonly recentTradesStoreService: RecentTradesStoreService,
    @Inject(TuiDialogService) private readonly dialogService: TuiDialogService
  ) {}

  public resetTrades(): void {
    this._usersTrades$.next(undefined);
    this.recentTradesStoreService.resetTrades();
  }

  public initStatusPolling(): Observable<UiRecentTrade[]> {
    return this._forceReload$.pipe(
      startWith(true),
      switchMap(() => interval(20000).pipe(startWith(-1))),
      map(() => this.recentTrades),
      switchMap(recentTrades => {
        return recentTrades && recentTrades?.length > 0
          ? from(
              asyncMap<RecentTrade, UiRecentTrade>(recentTrades, this.parseTradeForUi.bind(this))
            )
          : (from([]) as Observable<UiRecentTrade[]>);
      }),
      tap(uiUsersTrades => {
        this._usersTrades$.next(uiUsersTrades);
        console.log('parsed trades', this._usersTrades$.getValue());
      })
    );
  }

  private async parseTradeForUi(trade: RecentTrade, index: number): Promise<UiRecentTrade> {
    const parsedTrades = this._usersTrades$.getValue();

    if (trade?._parsed && parsedTrades && parsedTrades.length) {
      return parsedTrades[index];
    }

    const { srcTxHash, crossChainProviderType, fromToken, toToken, timestamp } = trade;
    const srcWeb3Provider = this.web3Public[trade.fromBlockchain] as EthLikeWeb3Public;
    const dstWeb3Provider = this.web3Public[trade.toBlockchain] as EthLikeWeb3Public;
    const srcTransactionReceipt = await srcWeb3Provider.getTransactionReceipt(srcTxHash);

    const fromBlockchainInfo = this.getFullBlockchainInfo(trade.fromBlockchain);
    const toBlockchainInfo = this.getFullBlockchainInfo(trade.toBlockchain);
    const srcTxLink = this.scannerLinkPipe.transform(
      srcTxHash,
      trade.fromBlockchain,
      ADDRESS_TYPE.TRANSACTION
    );

    const uiTrade = {
      fromBlockchain: fromBlockchainInfo,
      toBlockchain: toBlockchainInfo,
      fromToken,
      toToken,
      timestamp,
      srcTxLink,
      srcTxHash,
      crossChainProviderType
    };

    if (crossChainProviderType === CROSS_CHAIN_PROVIDER.CELER) {
      const { statusFrom, statusTo } = await this.getCelerTradeStatuses(
        srcWeb3Provider,
        dstWeb3Provider,
        srcTransactionReceipt,
        trade
      );

      return { statusFrom, statusTo, ...uiTrade };
    }

    if (crossChainProviderType === CROSS_CHAIN_PROVIDER.RUBIC) {
      const { statusTo, statusFrom } = await this.getRubicTradeStatuses(
        srcWeb3Provider,
        dstWeb3Provider,
        srcTxHash,
        trade
      );

      return { statusTo, statusFrom, ...uiTrade };
    }

    if (crossChainProviderType === CROSS_CHAIN_PROVIDER.SYMBIOSIS) {
      const { statusTo, statusFrom } = await this.getSymbiosisTradeStatuses(
        srcWeb3Provider,
        srcTxHash,
        trade
      );

      return {
        statusTo,
        statusFrom,
        ...uiTrade
      };
    }
  }

  private async getSymbiosisTradeStatuses(
    srcWeb3Provider: EthLikeWeb3Public,
    srcTxHash: string,
    trade: RecentTrade
  ): Promise<{
    statusFrom: RecentTradeStatus;
    statusTo: RecentTradeStatus;
  }> {
    const statusFrom = await this.getSourceTransactionStatus(srcWeb3Provider, srcTxHash);

    if (statusFrom === RecentTradeStatus.PENDING) {
      return { statusFrom, statusTo: RecentTradeStatus.PENDING };
    }

    if (statusFrom === RecentTradeStatus.FAIL) {
      return { statusFrom, statusTo: RecentTradeStatus.FAIL };
    }

    if (statusFrom === RecentTradeStatus.SUCCESS) {
      const isAverageTxTimeSpent = Date.now() - trade.timestamp > 150000;

      if (trade?._symbiosisSuccess) {
        return { statusFrom, statusTo: RecentTradeStatus.SUCCESS };
      }

      if (!isAverageTxTimeSpent) {
        return { statusFrom, statusTo: RecentTradeStatus.PENDING };
      } else {
        if (!Array.isArray(this.symbiosisPendingRequests)) {
          return { statusFrom, statusTo: RecentTradeStatus.PENDING };
        } else {
          const specificTx = this.symbiosisPendingRequests?.find(
            request => request.transactionHash === trade.srcTxHash
          );

          if (trade?._revertable === false) {
            return { statusFrom, statusTo: RecentTradeStatus.FALLBACK };
          }

          if (specificTx) {
            this.recentTradesStoreService.updateTrade({ ...trade, _revertable: true });
            return { statusFrom, statusTo: RecentTradeStatus.REVERT };
          }

          if (!specificTx) {
            this.recentTradesStoreService.updateTrade({ ...trade, _symbiosisSuccess: true });
            return { statusFrom, statusTo: RecentTradeStatus.SUCCESS };
          }

          if (!specificTx && trade?._revertable === true) {
            this.recentTradesStoreService.updateTrade({ ...trade, _symbiosisSuccess: true });
            return { statusFrom, statusTo: RecentTradeStatus.SUCCESS };
          }
        }
      }
    }
  }

  public loadSymbiosisPendingRequests(): Observable<PendingRequest[]> {
    return interval(21000).pipe(
      switchMap(() => this.symbiosisService.getPendingRequests()),
      tap(pendingRequests => (this.symbiosisPendingRequests = pendingRequests)),
      tap(() => {
        const symbiosisPendingRequestHashes = this.symbiosisPendingRequests.map(pendingRequest =>
          pendingRequest.transactionHash.toLocaleLowerCase()
        );
        const hasPendingTrades = this.recentTradesStoreService.currentUserRecentTrades
          .filter(trade => trade.crossChainProviderType === CROSS_CHAIN_PROVIDER.SYMBIOSIS)
          .some(item => symbiosisPendingRequestHashes.includes(item.srcTxHash.toLowerCase()));

        if (hasPendingTrades) {
          this._forceReload$.next(true);
        }
      })
    );
  }

  public readAllTrades(): void {
    setTimeout(() => this.recentTradesStoreService.updateUnreadTrades(true), 0);
  }

  public async revertSymbiosis(srcTxHash: string, fromBlockchain: BlockchainName): Promise<void> {
    let tradeInProgressSubscription$: Subscription;
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
      await this.symbiosisService.revertTrade(
        srcTxHash,
        onTransactionHash,
        this.symbiosisPendingRequests
      );

      tradeInProgressSubscription$.unsubscribe();
      this.notificationsService.show(this.translateService.instant('bridgePage.successMessage'), {
        label: this.translateService.instant('notifications.successfulTradeTitle'),
        status: TuiNotification.Success,
        autoClose: 15000
      });

      const tradeToUpdate = this.recentTradesStoreService.getSpecificTrade(
        srcTxHash,
        fromBlockchain
      );
      this.recentTradesStoreService.updateTrade({
        ...tradeToUpdate,
        _revertable: false
      });
      this._forceReload$.next(true);
    } catch (err) {
      this.errorService.catch(err);
    } finally {
      tradeInProgressSubscription$?.unsubscribe();
    }
  }

  private async getCelerTradeStatuses(
    srcWeb3Provider: EthLikeWeb3Public,
    dstWeb3Provider: EthLikeWeb3Public,
    srcTransactionReceipt: TransactionReceipt,
    trade: RecentTrade
  ): Promise<{ statusFrom: RecentTradeStatus; statusTo: RecentTradeStatus }> {
    const statusFrom = await this.getSourceTransactionStatus(
      srcWeb3Provider,
      srcTransactionReceipt.transactionHash
    );
    if (statusFrom === RecentTradeStatus.PENDING) {
      return { statusFrom, statusTo: RecentTradeStatus.PENDING };
    }

    if (statusFrom === RecentTradeStatus.FAIL) {
      this.recentTradesStoreService.updateTrade({ ...trade, _parsed: true });
      return { statusFrom, statusTo: RecentTradeStatus.FAIL };
    }

    if (statusFrom === RecentTradeStatus.SUCCESS) {
      const [requestLog] = decodeLogs(CELER_CONTRACT_ABI, srcTransactionReceipt).filter(Boolean); // filter undecoded logs
      const dstTransactionStatus = Number(
        await dstWeb3Provider.callContractMethod(
          CELER_CONTRACT[trade.toBlockchain as EthLikeBlockchainName],
          CELER_CONTRACT_ABI,
          'txStatusById',
          {
            methodArguments: [requestLog.params.find(param => param.name === 'id').value]
          }
        )
      ) as CelerSwapStatus;

      if (dstTransactionStatus === CelerSwapStatus.NULL) {
        return { statusFrom, statusTo: RecentTradeStatus.PENDING };
      }

      if (dstTransactionStatus === CelerSwapStatus.FAILED) {
        this.recentTradesStoreService.updateTrade({ ...trade, _parsed: true });
        return { statusFrom, statusTo: RecentTradeStatus.FAIL };
      }

      if (dstTransactionStatus === CelerSwapStatus.SUCСESS) {
        this.recentTradesStoreService.updateTrade({ ...trade, _parsed: true });
        return { statusFrom, statusTo: RecentTradeStatus.SUCCESS };
      }
    }
  }

  private async getRubicTradeStatuses(
    srcWeb3Provider: EthLikeWeb3Public,
    dstWeb3Provider: EthLikeWeb3Public,
    srcTxHash: string,
    trade: RecentTrade
  ): Promise<{ statusFrom: RecentTradeStatus; statusTo: RecentTradeStatus }> {
    const statusFrom = await this.getSourceTransactionStatus(srcWeb3Provider, srcTxHash);

    if (statusFrom === RecentTradeStatus.PENDING) {
      return { statusFrom, statusTo: RecentTradeStatus.PENDING };
    }

    if (statusFrom === RecentTradeStatus.FAIL) {
      this.recentTradesStoreService.updateTrade({ ...trade, _parsed: true });
      return { statusFrom, statusTo: RecentTradeStatus.FAIL };
    }

    if (statusFrom === RecentTradeStatus.SUCCESS) {
      const statusTo = Number(
        await dstWeb3Provider.callContractMethod(
          CROSS_CHAIN_PROD.contractAddresses[trade.toBlockchain],
          PROCESSED_TRANSACTION_METHOD_ABI,
          'processedTransactions',
          { methodArguments: [srcTxHash] }
        )
      );

      if (statusTo === RubicSwapStatus.NULL) {
        return { statusFrom, statusTo: RecentTradeStatus.PENDING };
      }

      if (statusTo === RubicSwapStatus.PROCESSED) {
        this.recentTradesStoreService.updateTrade({ ...trade, _parsed: true });
        return { statusFrom, statusTo: RecentTradeStatus.SUCCESS };
      }

      if (statusTo === RubicSwapStatus.REVERTED) {
        this.recentTradesStoreService.updateTrade({ ...trade, _parsed: true });
        return { statusFrom, statusTo: RecentTradeStatus.FAIL };
      }
    }
  }

  private async getSourceTransactionStatus(
    web3Provider: EthLikeWeb3Public,
    txHash: string
  ): Promise<RecentTradeStatus> {
    let receipt: TransactionReceipt;

    try {
      receipt = await web3Provider.getTransactionReceipt(txHash);
    } catch (_err) {
      receipt = null;
    }

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

  public openRecentTradesModal(): void {
    const desktopModalSize = 'xl' as 'l'; // hack for custom modal size
    const mobileModalSize = 'page';

    this.dialogService
      .open(new PolymorpheusComponent(RecentCrosschainTxComponent), {
        size: this.isMobile ? mobileModalSize : desktopModalSize
      })
      .subscribe();
  }
}
