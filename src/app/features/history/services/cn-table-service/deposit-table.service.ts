import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatestWith, forkJoin, from, Observable, of } from 'rxjs';
import { filter, map, share, startWith, switchMap } from 'rxjs/operators';
import { tuiIsFalsy, tuiIsPresent } from '@taiga-ui/cdk';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import { FormControl } from '@angular/forms';
import { TableService } from '@features/history/models/table-service';
import { CrossChainTransferTrade } from '@features/trade/models/cn-trade';
import { StoreService } from '@core/services/store/store.service';
import {
  RubicSdkError,
  CrossChainDepositStatus,
  CROSS_CHAIN_DEPOSIT_STATUS,
  getDepositStatus,
  CrossChainTradeType
} from '@cryptorubic/sdk';
import { blockchainLabel } from '@shared/constants/blockchain/blockchain-label';
import { blockchainColor } from '@shared/constants/blockchain/blockchain-color';
import { blockchainIcon } from '@shared/constants/blockchain/blockchain-icon';
import { Cacheable } from 'ts-cacheable';
import { TxStatus } from '@features/history/models/tx-status-mapping';
import BigNumber from 'bignumber.js';
import { DepositTableData } from '../../models/deposit-table-data';
import { BRIDGE_PROVIDERS } from '@app/features/trade/constants/bridge-providers';

@Injectable()
export class DepositTableService extends TableService<
  'date',
  CrossChainTransferTrade,
  DepositTableData
> {
  public readonly statusFilter = new FormControl<string>('All');

  private readonly _tableUpdate$ = new BehaviorSubject<void>(null);

  public readonly tableUpdate$ = this._tableUpdate$.asObservable();

  public readonly request$ = this.tableUpdate$.pipe(
    switchMap(() => this.getData().pipe(startWith(null))),
    share()
  );

  public readonly loading$ = this.request$.pipe(map(tuiIsFalsy));

  public readonly total$ = this.request$.pipe(
    filter(tuiIsPresent),
    map(({ total }) => total),
    startWith(1)
  );

  public readonly totalPages$ = this.total$.pipe(
    combineLatestWith(this.size$),
    map(([total, size]) => Math.ceil(total / size))
  );

  public readonly data$: Observable<DepositTableData[]> = this.request$.pipe(
    filter(tuiIsPresent),
    map(response => response.data.filter(tuiIsPresent)),
    startWith([])
  );

  constructor(
    protected readonly walletConnector: WalletConnectorService,
    private readonly storeService: StoreService
  ) {
    super('date');
  }

  protected getData(): Observable<{
    data: DepositTableData[];
    total: number;
  }> {
    const data = this.storeService.getItem('RUBIC_DEPOSIT_RECENT_TRADE') || [];
    const tradeStatuses = data.map(trade => {
      return this.getDepositStatus(trade);
    });

    return forkJoin(tradeStatuses).pipe(
      map(statuses => {
        const trades = statuses.map((originalStatus, index) => {
          const status = this.getStatus(originalStatus);
          const tradeData = data[index];
          const fromToken = {
            symbol: tradeData.fromToken.symbol,
            image: tradeData.fromToken.image,
            amount: new BigNumber(tradeData.fromAmount)
          };

          const toToken = {
            symbol: tradeData.toToken.symbol,
            image: tradeData.toToken.image,
            amount: new BigNumber(tradeData.toAmount)
          };

          const fromBlockchainName = tradeData.fromToken.blockchain;
          const fromBlockchain = {
            name: fromBlockchainName,
            label: blockchainLabel[fromBlockchainName],
            color: blockchainColor[fromBlockchainName],
            image: blockchainIcon[fromBlockchainName]
          };

          const toBlockchainName = tradeData.toToken.blockchain;
          const toBlockchain = {
            name: toBlockchainName,
            label: blockchainLabel[toBlockchainName],
            color: blockchainColor[toBlockchainName],
            image: blockchainIcon[toBlockchainName]
          };

          const providerInfo = BRIDGE_PROVIDERS[tradeData.tradeType as CrossChainTradeType];

          return {
            ...data[index],
            fromToken,
            toToken,
            fromBlockchain,
            toBlockchain,
            status,
            date: tradeData.timestamp.toString(),
            receiverAddress: tradeData.receiverAddress,
            providerInfo
          };
        });
        return {
          data: trades,
          total: trades.length
        };
      })
    );
  }

  protected transformResponse(_response: CrossChainTransferTrade): {
    data: DepositTableData[];
    total: number;
  } {
    return undefined;
  }

  @Cacheable({
    maxAge: 13_000
  })
  public getDepositStatus(trade: CrossChainTransferTrade): Observable<CrossChainDepositStatus> {
    if (!trade.id) {
      throw new RubicSdkError(`Must provide ${trade.tradeType} trade id`);
    }

    try {
      return from(
        getDepositStatus(trade.id, trade.tradeType, { depositMemo: trade.extraField.value })
      ).pipe(map(el => el.status as CrossChainDepositStatus));
    } catch {
      return of(CROSS_CHAIN_DEPOSIT_STATUS.WAITING);
    }
  }

  private getStatus(originalStatus: CrossChainDepositStatus): TxStatus {
    const txStatusMapping: Record<CrossChainDepositStatus, TxStatus> = {
      new: { appearance: 'info', label: 'New' },
      waiting: { appearance: 'info', label: 'Waiting' },
      confirming: { appearance: 'info', label: 'Confirming' },
      exchanging: { appearance: 'info', label: 'Exchanging' },
      sending: { appearance: 'info', label: 'Sending' },
      finished: { appearance: 'success', label: 'Success' },
      failed: { appearance: 'error', label: 'Failed' },
      refunded: { appearance: 'success', label: 'Refunded' },
      verifying: { appearance: 'info', label: 'Verifying' }
    };
    return txStatusMapping[originalStatus];
  }
}
