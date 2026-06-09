import { Injectable } from '@angular/core';
import { combineLatest, combineLatestWith, Observable, of, timer } from 'rxjs';
import { TableKey } from '@features/history/models/table-key';
import { debounceTime, filter, map, share, startWith, switchMap, takeUntil } from 'rxjs/operators';
import { tuiControlValue, tuiIsFalsy, tuiIsPresent } from '@taiga-ui/cdk';
import { CrossChainTableResponse } from '@features/history/models/cross-chain-table-response';
import { HttpService } from '@core/services/http/http.service';
import { CrossChainTableRequest } from '@features/history/models/cross-chain-table-request';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import { CrossChainTableData } from '@features/history/models/cross-chain-table-data';
import {
  BackendBlockchain,
  compareAddresses,
  FROM_BACKEND_BLOCKCHAINS,
  Token
} from '@cryptorubic/core';
import { blockchainIcon } from '@shared/constants/blockchain/blockchain-icon';
import { blockchainColor } from '@shared/constants/blockchain/blockchain-color';
import { blockchainLabel } from '@shared/constants/blockchain/blockchain-label';
import { TRADES_PROVIDERS } from '@features/trade/constants/trades-providers';
import { TradeProvider } from '@features/trade/models/trade-provider';
import { txStatusMapping } from '@features/history/models/tx-status-mapping';
import { DestinationTxStatus } from '@features/history/models/destination-tx-status';
import { FormControl } from '@angular/forms';
import { OnChainTableRequest } from '@features/history/models/on-chain-table-request';
import { TableService } from '@features/history/models/table-service';
import { FROM_BACKEND_CROSS_CHAIN_PROVIDERS } from '@cryptorubic/core';

@Injectable()
export class CrossChainTableService extends TableService<
  'created_at',
  CrossChainTableResponse,
  CrossChainTableData
> {
  public readonly statusFilter = new FormControl<string>('All');

  public readonly request$ = combineLatest([
    this.walletConnector.walletsManager.lastEvent$.pipe(
      filter(lastEvent =>
        compareAddresses(
          lastEvent.affectedWalletAddress,
          this.commonTableService.walletAddressCtrl.value
        )
      )
    ),
    this.sorter$,
    this.direction$,
    this.page$,
    this.size$,
    tuiControlValue<string>(this.statusFilter),
    this.activeItemIndex$,
    this.commonTableService.walletAddressChanges$.pipe(
      startWith(
        this.walletConnector.activeWallets.length
          ? this.walletConnector.activeWallets[0].address
          : ''
      )
    )
  ]).pipe(
    debounceTime(50),
    switchMap(([_, ...query]) => {
      if (!this.walletConnector.activeWallets.length) {
        return of({ data: [], total: 0 });
      }
      return timer(0, 30_000).pipe(
        switchMap(() => this.getData(...query).pipe(startWith(null))),
        takeUntil(this.activeItemIndex$.pipe(filter(activeItem => activeItem !== 0)))
      );
    }),
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

  public readonly data$: Observable<CrossChainTableData[]> = this.request$.pipe(
    filter(tuiIsPresent),
    map(response => response.data.filter(tuiIsPresent)),
    startWith([])
  );

  constructor(
    protected readonly httpService: HttpService,
    protected readonly walletConnector: WalletConnectorService
  ) {
    super('created_at');
  }

  protected getData(
    key: TableKey,
    direction: -1 | 1,
    page: number,
    pageSze: number,
    statusFilter: string,
    activeIndex: 0 | 1 | 2,
    walletAddress: string
  ): Observable<{
    data: CrossChainTableData[];
    total: number;
  }> {
    const filterField = Object.entries(txStatusMapping).find(
      ([, value]) => value.label === statusFilter
    )?.[0];

    const params: CrossChainTableRequest | OnChainTableRequest = {
      address: walletAddress,
      page: page + 1,
      pageSize: pageSze,
      ordering: direction === -1 ? `-${key}` : key,
      integrator: 'rubic',
      ...(filterField && activeIndex === 0 && { trade_status: filterField })
    };

    return this.httpService
      .get<CrossChainTableResponse>(`v2/trades/crosschain`, params)
      .pipe(map(response => this.transformResponse(response)));
  }

  protected transformResponse(response: CrossChainTableResponse): {
    data: CrossChainTableData[];
    total: number;
  } {
    return {
      data: response.results.map(backendData => {
        const fromToken = {
          symbol: backendData.from_token.symbol,

          image: backendData.from_token.logo_url,
          amount: Token.fromWei(backendData.from_amount, backendData.from_token.decimals)
        };

        const toToken = {
          symbol: backendData.to_token.symbol,
          image: backendData.to_token.logo_url,
          amount: Token.fromWei(backendData.to_amount, backendData.to_token.decimals)
        };

        const fromBlockchainName =
          FROM_BACKEND_BLOCKCHAINS[backendData.from_network as BackendBlockchain];
        const fromBlockchain = {
          name: fromBlockchainName,
          label: blockchainLabel[fromBlockchainName],
          color: blockchainColor[fromBlockchainName],
          image: blockchainIcon[fromBlockchainName]
        };

        const toBlockchainName =
          FROM_BACKEND_BLOCKCHAINS[backendData.to_network as BackendBlockchain];
        const toBlockchain = {
          name: toBlockchainName,
          label: blockchainLabel[toBlockchainName],
          color: blockchainColor[toBlockchainName],
          image: blockchainIcon[toBlockchainName]
        };

        const fromTx = {
          hash: backendData.source_transaction.hash,
          status: txStatusMapping[backendData.source_transaction.status],
          explorerLink: backendData.source_transaction.explorer_url
        };

        const toTx = {
          hash: backendData.dest_transaction.hash,
          status: txStatusMapping[backendData.status.toLowerCase() as DestinationTxStatus],
          explorerLink: backendData.dest_transaction.explorer_url
        };

        const provider =
          TRADES_PROVIDERS[
            FROM_BACKEND_CROSS_CHAIN_PROVIDERS[backendData.provider] as TradeProvider
          ];

        return {
          fromToken,
          toToken,
          fromBlockchain,
          toBlockchain,
          fromTx,
          toTx,
          date: backendData.created_at,
          provider,
          receiver: backendData.receiver,
          ...(backendData.changenow_id && { changenowId: backendData.changenow_id })
        };
      }),
      total: response.count
    };
  }
}
