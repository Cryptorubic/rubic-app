import { Inject, Injectable } from '@angular/core';
import { TransactionReceipt } from 'web3-eth';
import { EthLikeWeb3Public } from 'src/app/core/services/blockchain/blockchain-adapters/eth-like/web3-public/eth-like-web3-public';
import { PublicBlockchainAdapterService } from '@app/core/services/blockchain/blockchain-adapters/public-blockchain-adapter.service';
import { StoreService } from '@core/services/store/store.service';
import { BehaviorSubject, interval, map, Observable, startWith, switchMap, tap } from 'rxjs';
import {
  RecentTrade,
  UiRecentTrade
} from '../../../shared/models/my-trades/recent-trades.interface';
import { AuthService } from '@app/core/services/auth/auth.service';
import { CELER_CONTRACT_ABI } from '@app/features/swaps/features/cross-chain-routing/services/cross-chain-routing-service/celer/constants/CELER_CONTRACT_ABI';
import { CELER_CONTRACT } from '@app/features/swaps/features/cross-chain-routing/services/cross-chain-routing-service/celer/constants/CELER_CONTRACT';
import {
  BlockchainName,
  EthLikeBlockchainName
} from '../../../shared/models/blockchain/blockchain-name';
import { CelerSwapStatus } from '@app/features/swaps/features/cross-chain-routing/services/cross-chain-routing-service/celer/models/celer-swap-status.enum';
import { CROSS_CHAIN_PROD } from 'src/environments/constants/cross-chain';
import { AbiItem } from 'web3-utils';
import { CROSS_CHAIN_PROVIDER } from '@app/features/swaps/features/cross-chain-routing/services/cross-chain-routing-service/models/cross-chain-trade';
import { ScannerLinkPipe } from '../../../shared/pipes/scanner-link.pipe';
import ADDRESS_TYPE from '../../../shared/models/blockchain/address-type';
import { RecentTradeStatus } from '../../../shared/models/my-trades/recent-trade-status.enum';
import { decodeLogs } from './decode-logs';
import { TuiDialogService } from '@taiga-ui/core';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { RecentCrosschainTxComponent } from '@app/core/header/components/recent-crosschain-tx/recent-crosschain-tx.component';
import { HeaderStore } from '@app/core/header/services/header.store';
import { Blockchain, BLOCKCHAINS } from '@app/features/my-trades/constants/blockchains';
import { asyncMap } from '@shared/utils/utils';

const MAX_LATEST_TRADES = 3;

const PROCESSED_TRANSACTION_METHOD_ABI: AbiItem[] = [
  {
    inputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    name: 'processedTransactions',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  }
];

enum RubicSwapStatus {
  NULL = 0,
  PROCESSED = 1,
  REVERTED = 2
}

@Injectable({
  providedIn: 'root'
})
export class RecentTradesService {
  private get recentTradesLS(): { [address: string]: RecentTrade[] } {
    return this.storeService.fetchData().recentTrades;
  }

  private get unreadTradesLS(): { [address: string]: number } {
    return this.storeService.fetchData().unreadTrades;
  }

  public get userAddress(): string {
    return this.authService.userAddress;
  }

  public get isMobile(): boolean {
    return this.headerStoreService.isMobile;
  }

  private readonly _usersTrades$ = new BehaviorSubject<UiRecentTrade[]>(undefined);

  public readonly usersTrades$ = this._usersTrades$.asObservable();

  private readonly _unreadTrades$ = new BehaviorSubject<{ [address: string]: number }>(
    this.unreadTradesLS
  );

  public readonly unreadTrades$ = this._unreadTrades$
    .asObservable()
    .pipe(map(unreadTrades => unreadTrades?.[this.userAddress] || 0));

  constructor(
    private readonly storeService: StoreService,
    private readonly web3Public: PublicBlockchainAdapterService,
    private readonly authService: AuthService,
    private readonly scannerLinkPipe: ScannerLinkPipe,
    private readonly headerStoreService: HeaderStore,
    @Inject(TuiDialogService) private readonly dialogService: TuiDialogService
  ) {}

  public resetTrades(): void {
    this._usersTrades$.next(undefined);
  }

  public saveTrade(address: string, tradeData: RecentTrade): void {
    const currentUsersTrades = [...(this.recentTradesLS?.[address] || [])];

    if (currentUsersTrades?.length === MAX_LATEST_TRADES) {
      currentUsersTrades.pop();
    }
    currentUsersTrades.unshift(tradeData);

    const updatedTrades = { ...this.recentTradesLS, [address]: currentUsersTrades };

    this.storeService.setItem('recentTrades', updatedTrades);
    this.updateUnreadTrades();
  }

  private saveTradeAsParsed(trade: RecentTrade): void {
    const currentUsersTrades = this.recentTradesLS?.[this.userAddress];
    const tradeIndex = currentUsersTrades.indexOf(
      currentUsersTrades.find(
        savedTrade =>
          savedTrade.fromBlockchain === trade.fromBlockchain &&
          savedTrade.srcTxHash === trade.srcTxHash
      )
    );
    currentUsersTrades[tradeIndex] = trade;
    const updatedTrades = { ...this.recentTradesLS, [this.userAddress]: currentUsersTrades };
    this.storeService.setItem('recentTrades', updatedTrades);
  }

  public initStatusPolling(): Observable<UiRecentTrade[]> {
    return interval(10000).pipe(
      startWith(0),
      switchMap(async () => {
        const recentTrades = this.recentTradesLS[this.userAddress];
        return recentTrades?.length > 0
          ? await asyncMap<RecentTrade, UiRecentTrade>(
              recentTrades,
              this.parseTradeForUi.bind(this)
            )
          : ([] as UiRecentTrade[]);
      }),
      tap(uiUsersTrades => this._usersTrades$.next(uiUsersTrades))
    );
  }

  private async parseTradeForUi(trade: RecentTrade, index: number): Promise<UiRecentTrade> {
    const parsedTrades = this._usersTrades$.getValue();

    if (trade._parsed && parsedTrades && parsedTrades.length) {
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
      srcTxLink
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
      this.saveTradeAsParsed({ ...trade, _parsed: true });
      return { statusFrom, statusTo: RecentTradeStatus.FAIL };
    }

    if (statusFrom === RecentTradeStatus.SUCCESS) {
      const [requestLog] = decodeLogs(CELER_CONTRACT_ABI, srcTransactionReceipt).filter(Boolean); // filter undecoded logs
      const dstTransactionStatus = (await dstWeb3Provider.callContractMethod(
        CELER_CONTRACT[trade.toBlockchain as EthLikeBlockchainName],
        CELER_CONTRACT_ABI,
        'txStatusById',
        {
          methodArguments: [requestLog.params.find(param => param.name === 'id').value]
        }
      )) as CelerSwapStatus;

      if (dstTransactionStatus === CelerSwapStatus.NULL) {
        return { statusFrom, statusTo: RecentTradeStatus.PENDING };
      }

      if (dstTransactionStatus === CelerSwapStatus.FAILED) {
        this.saveTradeAsParsed({ ...trade, _parsed: true });
        return { statusFrom, statusTo: RecentTradeStatus.FAIL };
      }

      if (dstTransactionStatus === CelerSwapStatus.SUCСESS) {
        this.saveTradeAsParsed({ ...trade, _parsed: true });
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
      this.saveTradeAsParsed({ ...trade, _parsed: true });
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
        this.saveTradeAsParsed({ ...trade, _parsed: true });
        return { statusFrom, statusTo: RecentTradeStatus.SUCCESS };
      }

      if (statusTo === RubicSwapStatus.REVERTED) {
        this.saveTradeAsParsed({ ...trade, _parsed: true });
        return { statusFrom, statusTo: RecentTradeStatus.FAIL };
      }
    }
  }

  private async getSourceTransactionStatus(
    web3Provider: EthLikeWeb3Public,
    txHash: string
  ): Promise<RecentTradeStatus> {
    const receipt = await web3Provider.getTransactionReceipt(txHash);

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

  public updateUnreadTrades(readAll = false): void {
    const currentUsersUnreadTrades = this.unreadTradesLS?.[this.userAddress] || 0;

    const update = (value: { [address: string]: number }): void => {
      this.storeService.setItem('unreadTrades', value);
      this._unreadTrades$.next(value);
    };

    if (readAll && currentUsersUnreadTrades !== 0) {
      update({ ...this.unreadTradesLS, [this.userAddress]: 0 });
      return;
    }

    if (currentUsersUnreadTrades === 3) {
      return;
    }

    update({
      ...this.unreadTradesLS,
      [this.userAddress]: currentUsersUnreadTrades + 1
    });
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
