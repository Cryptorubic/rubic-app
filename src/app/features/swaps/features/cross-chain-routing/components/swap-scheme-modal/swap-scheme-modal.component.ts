import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { Provider, TRADES_PROVIDERS } from '@app/shared/constants/common/trades-providers';
import {
  BlockchainName,
  BLOCKCHAIN_NAME,
  EthLikeBlockchainName
} from '@app/shared/models/blockchain/blockchain-name';
import { INSTANT_TRADE_PROVIDER } from '@app/shared/models/instant-trade/instant-trade-provider';
import { TuiDialogContext, TuiNotification } from '@taiga-ui/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { TokenAmount } from '@app/shared/models/tokens/token-amount';
import { Blockchain, BLOCKCHAINS } from '@app/features/my-trades/constants/blockchains';
import {
  CrossChainProvider,
  CROSS_CHAIN_PROVIDER
} from '../../services/cross-chain-routing-service/models/cross-chain-trade';
import { ThemeService } from '@app/core/services/theme/theme.service';
import { filter, map, startWith, switchMap, takeWhile, tap } from 'rxjs/operators';
import { BehaviorSubject, from, interval, Observable, delay, Subscription, iif, of } from 'rxjs';
import { PublicBlockchainAdapterService } from '@app/core/services/blockchain/blockchain-adapters/public-blockchain-adapter.service';
import { EthLikeWeb3Public } from '@app/core/services/blockchain/blockchain-adapters/eth-like/web3-public/eth-like-web3-public';
import { TransactionReceipt } from 'web3-eth';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { CROSS_CHAIN_PROD } from 'src/environments/constants/cross-chain';
import { CelerSwapStatus } from '../../services/cross-chain-routing-service/celer/models/celer-swap-status.enum';
import { CELER_CONTRACT_ABI } from '../../services/cross-chain-routing-service/celer/constants/CELER_CONTRACT_ABI';
import { CELER_CONTRACT } from '../../services/cross-chain-routing-service/celer/constants/CELER_CONTRACT';
import { decodeLogs } from '@app/core/recent-trades/decode-logs';
import { SymbiosisService } from '@app/features/my-trades/services/symbiosis-service/symbiosis.service';
import { PendingRequest } from 'symbiosis-js-sdk';
import { TranslateService } from '@ngx-translate/core';
import { ErrorsService } from '@app/core/errors/errors.service';
import { NotificationsService } from '@app/core/services/notifications/notifications.service';
import { isNil } from '@app/shared/utils/utils';
import { RubicSwapStatus } from '@app/shared/models/swaps/rubic-swap-status.enum';
import { PROCESSED_TRANSACTION_METHOD_ABI } from '@app/shared/constants/common/processed-transaction-method-abi';

export interface CrosschainSwapSchemeData {
  srcProvider: INSTANT_TRADE_PROVIDER;
  dstProvider: INSTANT_TRADE_PROVIDER;
  fromToken: TokenAmount;
  toToken: TokenAmount;
  fromBlockchain: BlockchainName;
  toBlockchain: BlockchainName;
  crossChainProvider: CrossChainProvider;
  srcTxHash: string;
}

enum MODAL_SWAP_STATUS {
  SUCCESS = 'SUCCESS',
  PENDING = 'PENDING',
  FAIL = 'FAIL',
  UNKNOWN = 'UNKNOWN',
  REVERT = 'REVERT'
}

@Component({
  selector: 'app-swap-scheme-modal',
  templateUrl: './swap-scheme-modal.component.html',
  styleUrls: ['./swap-scheme-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SwapSchemeModalComponent implements OnInit {
  public trade: CrosschainSwapSchemeData;

  public srcProvider: Provider;

  public dstProvider: Provider;

  public fromToken: TokenAmount;

  public toToken: TokenAmount;

  public fromBlockchain: Blockchain;

  public toBlockchain: Blockchain;

  public crossChainProvider: CrossChainProvider;

  private srcTxHash: string;

  private srcTxBlockNumber: number;

  private txTimestamp: number;

  private srcWeb3Public: EthLikeWeb3Public;

  private dstWeb3Public: EthLikeWeb3Public;

  public readonly isDarkTheme$ = this.themeService.theme$.pipe(map(theme => theme === 'dark'));

  private readonly _srcTxStatus$ = new BehaviorSubject<MODAL_SWAP_STATUS>(
    MODAL_SWAP_STATUS.PENDING
  );

  public readonly srcTxStatus$ = this._srcTxStatus$.asObservable();

  private readonly _dstTxStatus$ = new BehaviorSubject<MODAL_SWAP_STATUS>(
    MODAL_SWAP_STATUS.UNKNOWN
  );

  public readonly dstTxStatus$ = this._dstTxStatus$.asObservable();

  private readonly _tradeProcessingStatus$ = new BehaviorSubject<MODAL_SWAP_STATUS>(
    MODAL_SWAP_STATUS.UNKNOWN
  );

  public readonly tradeProcessingStatus$ = this._tradeProcessingStatus$.asObservable();

  public readonly MODAL_SWAP_STATUS = MODAL_SWAP_STATUS;

  private symbiosisPendingRequests: PendingRequest[];

  private readonly _revertBtnLoading$ = new BehaviorSubject<boolean>(false);

  public readonly revertBtnLoading$ = this._revertBtnLoading$.asObservable();

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: TuiDialogContext<boolean, CrosschainSwapSchemeData>,
    @Inject(TuiDestroyService) private readonly destroy$: TuiDestroyService,
    private readonly themeService: ThemeService,
    private readonly web3Public: PublicBlockchainAdapterService,
    private readonly symbiosisService: SymbiosisService,
    private readonly translateService: TranslateService,
    private readonly errorService: ErrorsService,
    private readonly notificationService: NotificationsService
  ) {
    this.setTradeData(this.context.data);

    from(this.srcWeb3Public.getTransactionByHash(this.srcTxHash)).subscribe(tx => {
      this.srcTxBlockNumber = Number(tx?.blockNumber);
    });
  }

  ngOnInit(): void {
    this.initSrcTxStatusPolling()
      .pipe(
        takeWhile(srcTxStatus => {
          return srcTxStatus === MODAL_SWAP_STATUS.PENDING;
        })
      )
      .subscribe();

    this.srcTxStatus$
      .pipe(
        filter(srcTxStatus => srcTxStatus === MODAL_SWAP_STATUS.SUCCESS),
        switchMap(() => {
          return this.initTradeProcessingStatusPolling();
        }),
        takeWhile(tradeProcessingStatus => tradeProcessingStatus === MODAL_SWAP_STATUS.PENDING)
      )
      .subscribe();

    this.tradeProcessingStatus$
      .pipe(
        filter(tradeProcessingStatus => tradeProcessingStatus === MODAL_SWAP_STATUS.SUCCESS),
        switchMap(() => {
          return this.initDstTxStatusPolling();
        }),
        takeWhile(dstTxStatus => dstTxStatus === MODAL_SWAP_STATUS.PENDING)
      )
      .subscribe();
  }

  public initSrcTxStatusPolling(): Observable<MODAL_SWAP_STATUS> {
    return interval(5000).pipe(
      delay(new Date(Date.now() + 2000)),
      startWith(-1),
      switchMap(() => {
        return from(this.getSourceTxStatus(this.srcTxHash));
      }),
      tap(srcTxStatus => this._srcTxStatus$.next(srcTxStatus))
    );
  }

  public initTradeProcessingStatusPolling(): Observable<MODAL_SWAP_STATUS> {
    this._tradeProcessingStatus$.next(MODAL_SWAP_STATUS.PENDING);
    return interval(5000).pipe(
      startWith(-1),
      switchMap(() => {
        return iif(
          () => isNil(this.srcTxBlockNumber),
          from(this.srcWeb3Public.getTransactionByHash(this.srcTxHash)).pipe(
            switchMap(tx => {
              this.srcTxBlockNumber = tx?.blockNumber || 0;
              return this.srcWeb3Public.getBlockNumber();
            })
          ),
          from(this.srcWeb3Public.getBlockNumber())
        );
      }),
      map(currentBlockNumber => {
        const diff = this.fromBlockchain.key === BLOCKCHAIN_NAME.ETHEREUM ? 5 : 10;
        console.log({ currentBlockNumber, txBlock: this.srcTxBlockNumber });
        return currentBlockNumber - this.srcTxBlockNumber > diff
          ? MODAL_SWAP_STATUS.SUCCESS
          : MODAL_SWAP_STATUS.PENDING;
      }),
      tap(tradeProcessingStatus => this._tradeProcessingStatus$.next(tradeProcessingStatus))
    );
  }

  public initDstTxStatusPolling(): Observable<MODAL_SWAP_STATUS> {
    this._dstTxStatus$.next(MODAL_SWAP_STATUS.PENDING);
    if (this.crossChainProvider !== CROSS_CHAIN_PROVIDER.SYMBIOSIS) {
      return interval(5000).pipe(
        startWith(-1),
        switchMap(() => {
          if (this.crossChainProvider === CROSS_CHAIN_PROVIDER.RUBIC) {
            return this.getRubicDstTxStatus();
          }

          if (this.crossChainProvider === CROSS_CHAIN_PROVIDER.CELER) {
            return this.getCelerDstTxStatus();
          }
        }),
        tap(dstTxStatus => this._dstTxStatus$.next(dstTxStatus))
      );
    } else {
      return interval(7000).pipe(
        startWith(-1),
        switchMap(() => this.getSymbiosisDstTxStatus()),
        tap(dstTxStatus => this._dstTxStatus$.next(dstTxStatus))
      );
    }
  }

  private async getCelerDstTxStatus(): Promise<MODAL_SWAP_STATUS> {
    const srcTransactionReceipt = await this.srcWeb3Public.getTransactionReceipt(this.srcTxHash);
    const [requestLog] = decodeLogs(CELER_CONTRACT_ABI, srcTransactionReceipt).filter(Boolean); // filter undecoded logs
    const dstTransactionStatus = Number(
      await this.dstWeb3Public.callContractMethod(
        CELER_CONTRACT[this.fromBlockchain.key as EthLikeBlockchainName],
        CELER_CONTRACT_ABI,
        'txStatusById',
        {
          methodArguments: [requestLog.params.find(param => param.name === 'id').value]
        }
      )
    ) as CelerSwapStatus;

    if (dstTransactionStatus === CelerSwapStatus.NULL) {
      return MODAL_SWAP_STATUS.PENDING;
    }

    if (dstTransactionStatus === CelerSwapStatus.FAILED) {
      return MODAL_SWAP_STATUS.FAIL;
    }

    if (dstTransactionStatus === CelerSwapStatus.SUCСESS) {
      return MODAL_SWAP_STATUS.SUCCESS;
    }
  }

  private async getRubicDstTxStatus(): Promise<MODAL_SWAP_STATUS> {
    const statusTo = Number(
      await this.dstWeb3Public.callContractMethod(
        CROSS_CHAIN_PROD.contractAddresses[this.toBlockchain.key],
        PROCESSED_TRANSACTION_METHOD_ABI,
        'processedTransactions',
        { methodArguments: [this.srcTxHash] }
      )
    );

    if (statusTo === RubicSwapStatus.NULL) {
      return MODAL_SWAP_STATUS.PENDING;
    }

    if (statusTo === RubicSwapStatus.PROCESSED) {
      return MODAL_SWAP_STATUS.SUCCESS;
    }

    if (statusTo === RubicSwapStatus.REVERTED) {
      return MODAL_SWAP_STATUS.FAIL;
    }
  }

  private getSymbiosisDstTxStatus(): Observable<MODAL_SWAP_STATUS> {
    const currentTimestamp = Date.now();
    const diff = 300000;

    if (currentTimestamp - this.txTimestamp < diff) {
      return of(MODAL_SWAP_STATUS.PENDING);
    } else {
      return from(this.symbiosisService.getPendingRequests()).pipe(
        map(pendingRequests => {
          this.symbiosisPendingRequests = pendingRequests;
          const specificTx = this.symbiosisPendingRequests?.find(
            request => request.transactionHash === this.srcTxHash
          );

          console.log({ pendingRequests });

          if (specificTx) {
            return MODAL_SWAP_STATUS.REVERT;
          } else {
            return MODAL_SWAP_STATUS.SUCCESS;
          }
        })
      );
    }
  }

  private async getSourceTxStatus(txHash: string): Promise<MODAL_SWAP_STATUS> {
    let receipt: TransactionReceipt;

    try {
      receipt = await this.srcWeb3Public.getTransactionReceipt(txHash);
    } catch (_err) {
      receipt = null;
    }

    if (receipt === null) {
      return MODAL_SWAP_STATUS.PENDING;
    } else {
      return receipt.status ? MODAL_SWAP_STATUS.SUCCESS : MODAL_SWAP_STATUS.FAIL;
    }
  }

  public async revertSymbiosisTrade(): Promise<void> {
    let tradeInProgressSubscription$: Subscription;
    const onTransactionHash = () => {
      tradeInProgressSubscription$ = this.notificationService.show(
        this.translateService.instant('bridgePage.progressMessage'),
        {
          label: this.translateService.instant('notifications.tradeInProgress'),
          status: TuiNotification.Info,
          autoClose: false
        }
      );
    };

    this._revertBtnLoading$.next(true);

    try {
      await this.symbiosisService.revertTrade(
        this.srcTxHash,
        onTransactionHash,
        this.symbiosisPendingRequests
      );

      tradeInProgressSubscription$.unsubscribe();
      this.notificationService.show(this.translateService.instant('bridgePage.successMessage'), {
        label: this.translateService.instant('notifications.successfulTradeTitle'),
        status: TuiNotification.Success,
        autoClose: 15000
      });
      this.context.completeWith(true);
    } catch (err) {
      this.errorService.catch(err);
    } finally {
      this._revertBtnLoading$.next(false);
      tradeInProgressSubscription$?.unsubscribe();
    }
  }

  public setTradeData(data: CrosschainSwapSchemeData): void {
    this.srcProvider = TRADES_PROVIDERS[data.srcProvider];
    this.dstProvider = TRADES_PROVIDERS[data.dstProvider];

    this.fromBlockchain = BLOCKCHAINS[data.fromBlockchain];
    this.toBlockchain = BLOCKCHAINS[data.toBlockchain];

    this.fromToken = data.fromToken;
    this.toToken = data.toToken;

    this.srcTxHash = data.srcTxHash;

    this.crossChainProvider = data.crossChainProvider;

    this.txTimestamp = Date.now();

    this.srcWeb3Public = this.getWeb3Public(data.fromBlockchain);

    this.dstWeb3Public = this.getWeb3Public(data.toBlockchain);
  }

  private getWeb3Public(blockchain: BlockchainName): EthLikeWeb3Public {
    return this.web3Public[blockchain] as EthLikeWeb3Public;
  }

  public closeModalAndOpenMyTrades(): void {}
}
