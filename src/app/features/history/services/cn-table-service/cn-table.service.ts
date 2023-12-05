import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatestWith, forkJoin, Observable, of } from 'rxjs';
import { filter, map, share, startWith, switchMap } from 'rxjs/operators';
import { tuiIsFalsy, tuiIsPresent } from '@taiga-ui/cdk';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import { FormControl } from '@angular/forms';
import { TableService } from '@features/history/models/table-service';
import { ChangenowPostTrade } from '@features/trade/models/cn-trade';
import { StoreService } from '@core/services/store/store.service';
import {
  CHANGENOW_API_STATUS,
  changenowApiKey,
  ChangenowApiResponse,
  ChangenowApiStatus,
  RubicSdkError
} from 'rubic-sdk';
import { blockchainLabel } from '@shared/constants/blockchain/blockchain-label';
import { blockchainColor } from '@shared/constants/blockchain/blockchain-color';
import { blockchainIcon } from '@shared/constants/blockchain/blockchain-icon';
import { CnTableData } from '@features/history/models/cn-table-data';
import { HttpClient } from '@angular/common/http';
import { Cacheable } from 'ts-cacheable';
import { TxStatus } from '@features/history/models/tx-status-mapping';
import BigNumber from 'bignumber.js';

@Injectable()
export class CnTableService extends TableService<'date', ChangenowPostTrade, CnTableData> {
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
    map(([total, size]) => Math.trunc(total / size) + 1)
  );

  public readonly data$: Observable<CnTableData[]> = this.request$.pipe(
    filter(tuiIsPresent),
    map(response => response.data.filter(tuiIsPresent)),
    startWith([])
  );

  constructor(
    protected readonly walletConnector: WalletConnectorService,
    private readonly storeService: StoreService,
    private readonly httpClient: HttpClient
  ) {
    super('date');
  }

  protected getData(): Observable<{
    data: CnTableData[];
    total: number;
  }> {
    const data = this.storeService.getItem('RUBIC_CHANGENOW_RECENT_TRADE') || [];
    const tradeStatuses = data.map(trade => {
      return this.getChangenowSwapStatus(trade.id);
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

          return {
            ...data[index],
            fromToken,
            toToken,
            fromBlockchain,
            toBlockchain,
            status,
            date: tradeData.timestamp.toString(),
            receiverAddress: tradeData.receiverAddress
          };
        });
        console.log(trades);
        return {
          data: trades,
          total: trades.length
        };
      })
    );
  }

  protected transformResponse(_response: ChangenowPostTrade): {
    data: CnTableData[];
    total: number;
  } {
    return undefined;
  }

  @Cacheable({
    maxAge: 13_000
  })
  public getChangenowSwapStatus(id: string): Observable<ChangenowApiStatus> {
    if (!id) {
      throw new RubicSdkError('Must provide changenow trade id');
    }

    try {
      return this.httpClient
        .get<ChangenowApiResponse>('https://api.changenow.io/v2/exchange/by-id', {
          params: { id: id },
          headers: { 'x-changenow-api-key': changenowApiKey }
        })
        .pipe(map(el => el.status));
    } catch {
      return of(CHANGENOW_API_STATUS.WAITING);
    }
  }

  private getStatus(originalStatus: ChangenowApiStatus): TxStatus {
    const txStatusMapping: Record<ChangenowApiStatus, TxStatus> = {
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
