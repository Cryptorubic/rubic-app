import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatestWith, forkJoin, from, Observable, of } from 'rxjs';
import { catchError, filter, map, share, startWith, switchMap } from 'rxjs/operators';
import { tuiIsFalsy, tuiIsPresent } from '@taiga-ui/cdk';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import { FormControl } from '@angular/forms';
import { TableService } from '@features/history/models/table-service';
import { CrossChainTransferTrade } from '@features/trade/models/cn-trade';
import { StoreService } from '@core/services/store/store.service';
import { blockchainLabel } from '@shared/constants/blockchain/blockchain-label';
import { blockchainColor } from '@shared/constants/blockchain/blockchain-color';
import { blockchainIcon } from '@shared/constants/blockchain/blockchain-icon';
import { Cacheable } from 'ts-cacheable';
import { TxStatus } from '@features/history/models/tx-status-mapping';
import BigNumber from 'bignumber.js';
import { DepositTableData } from '../../models/deposit-table-data';
import { BRIDGE_PROVIDERS } from '@app/features/trade/constants/bridge-providers';
import {
  API_STATUS_TO_DEPOSIT_STATUS,
  CROSS_CHAIN_DEPOSIT_STATUS,
  CrossChainDepositStatus
} from '@app/core/services/sdk/sdk-legacy/features/cross-chain/calculation-manager/providers/common/cross-chain-transfer-trade/models/cross-chain-deposit-statuses';
import { RubicSdkError } from '@cryptorubic/web3';
import { CrossChainTradeType } from '@app/core/services/sdk/sdk-legacy/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { TokenAmountDirective } from '@app/shared/directives/token-amount/token-amount.directive';
import { RubicApiService } from '@app/core/services/sdk/sdk-legacy/rubic-api/rubic-api.service';
import { CrossChainTxStatusConfig } from '@app/core/services/sdk/sdk-legacy/features/ws-api/models/cross-chain-tx-status-config';

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
    private readonly storeService: StoreService,
    private readonly rubicApiService: RubicApiService
  ) {
    super('date');
  }

  protected getData(): Observable<{
    data: DepositTableData[];
    total: number;
  }> {
    // @FIX after 24.02.2026 use const
    let data = this.storeService.getItem('RUBIC_DEPOSIT_RECENT_TRADE') || [];

    /**
     * @FIX remove after 24.02.2026
     * Cause in prev versions RUBIC_DEPOSIT_RECENT_TRADE didn't contain field `rubicId`.
     * It causes 404 response of `statusExtended` call
     */
    const dataLen = data.length;
    data = data.filter(deposit => !!deposit.rubicId);
    const filteredDataLen = data.length;
    if (dataLen !== filteredDataLen) {
      this.storeService.setItem('RUBIC_DEPOSIT_RECENT_TRADE', data);
    }

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
            amount: new BigNumber(TokenAmountDirective.replaceCommas(tradeData.fromAmount))
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
    if (!trade.id) throw new RubicSdkError(`Must provide ${trade.tradeType} trade id`);

    try {
      return from(this.rubicApiService.fetchCrossChainTxStatusExtended(trade.rubicId)).pipe(
        catchError(() => of({ status: 'PENDING' } as CrossChainTxStatusConfig)),
        map(response => API_STATUS_TO_DEPOSIT_STATUS[response.status])
      );
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
      verifying: { appearance: 'info', label: 'Verifying' },
      expired: { appearance: 'info', label: 'Expired' }
    };
    return txStatusMapping[originalStatus];
  }
}
