import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { TableKey } from '@features/history/models/table-key';
import { debounceTime, filter, map, share, startWith, switchMap } from 'rxjs/operators';
import { tuiControlValue, tuiIsFalsy, tuiIsPresent } from '@taiga-ui/cdk';
import { CrossChainTableResponse } from '@features/history/models/cross-chain-table-response';
import { HttpService } from '@core/services/http/http.service';
import { CrossChainTableRequest } from '@features/history/models/cross-chain-table-request';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import { CrossChainTableData } from '@features/history/models/cross-chain-table-data';
import { Web3Pure } from 'rubic-sdk';
import { blockchainIcon } from '@shared/constants/blockchain/blockchain-icon';
import { FROM_BACKEND_BLOCKCHAINS } from '@shared/constants/blockchain/backend-blockchains';
import { blockchainColor } from '@shared/constants/blockchain/blockchain-color';
import { blockchainLabel } from '@shared/constants/blockchain/blockchain-label';
import { TRADES_PROVIDERS } from '@features/trade/constants/trades-providers';
import { TradeProvider } from '@features/trade/models/trade-provider';
import { txStatusMapping } from '@features/history/models/tx-status-mapping';
import { DestinationTxStatus } from '@features/history/models/destination-tx-status';
import { FormControl } from '@angular/forms';
import { OnChainTableData } from '@features/history/models/on-chain-table-data';
import { OnChainTableResponse } from '@features/history/models/on-chain-table-response';
import { OnChainTableRequest } from '@features/history/models/on-chain-table-request';
import { BACKEND_PROVIDERS } from '@core/services/backend/instant-trades-api/constants/backend-providers';

@Injectable()
export class TableService {
  private readonly _activeItemIndex$ = new BehaviorSubject<0 | 1>(0);

  public readonly activeItemIndex$ = this._activeItemIndex$.asObservable();

  public set activeItemIndex(value: 0 | 1) {
    this._activeItemIndex$.next(value);
  }

  private readonly _size$ = new BehaviorSubject<number>(10);

  public readonly size$ = this._size$.asObservable();

  private readonly _page$ = new BehaviorSubject<number>(0);

  public readonly page$ = this._page$.asObservable();

  private readonly _direction$ = new BehaviorSubject<-1 | 1>(-1);

  public readonly direction$ = this._direction$.asObservable();

  private readonly _sorter$ = new BehaviorSubject<TableKey>('created_at');

  public readonly sorter$ = this._sorter$.asObservable();

  public readonly statusFilter = new FormControl<string>('All');

  readonly request$ = combineLatest([
    this.sorter$,
    this.direction$,
    this.page$,
    this.size$,
    tuiControlValue<string>(this.statusFilter),
    this.activeItemIndex$
  ]).pipe(
    // zero time debounce for a case when both key and direction change
    debounceTime(50),
    switchMap(query => this.getData(...query).pipe(startWith(null))),
    share()
  );

  readonly loading$ = this.request$.pipe(map(tuiIsFalsy));

  readonly total$ = this.request$.pipe(
    filter(tuiIsPresent),
    map(({ total }) => total),
    startWith(1)
  );

  readonly data$: Observable<readonly (CrossChainTableData | OnChainTableData)[]> =
    this.request$.pipe(
      filter(tuiIsPresent),
      map(response => response.data.filter(tuiIsPresent)),
      startWith([])
    );

  constructor(
    private readonly httpService: HttpService,
    private readonly walletConnector: WalletConnectorService
  ) {}

  public onDirection(direction: -1 | 1): void {
    this._direction$.next(direction);
  }

  public onSize(size: number): void {
    this._size$.next(size);
  }

  public onPage(page: number): void {
    this._page$.next(page);
  }

  public onSorting(page: TableKey): void {
    this._sorter$.next(page);
  }

  private getData(
    key: TableKey,
    direction: -1 | 1,
    page: number,
    pageSze: number,
    statusFilter: string,
    activeIndex: 0 | 1
  ): Observable<{
    data: (CrossChainTableData | OnChainTableData)[];
    total: number;
  }> {
    const address = this.walletConnector.address;
    const filterField = Object.entries(txStatusMapping).find(
      ([, value]) => value.label === statusFilter
    )?.[0];
    const isCrossChain = activeIndex === 0;

    const params: CrossChainTableRequest | OnChainTableRequest = {
      address,
      page: page + 1,
      pageSize: pageSze,
      ordering: direction === -1 ? `-${key}` : key,
      ...(filterField && activeIndex === 0 && { trade_status: filterField })
    };
    const path = isCrossChain ? 'crosschain' : 'onchain';

    return this.httpService
      .get<CrossChainTableResponse | OnChainTableResponse>(`v2/trades/${path}`, params)
      .pipe(
        map(response =>
          isCrossChain
            ? this.transformCrossChainResponse(response as CrossChainTableResponse)
            : this.transformOnChainResponse(response as OnChainTableResponse)
        )
      );
  }

  private transformOnChainResponse(response: OnChainTableResponse): {
    data: OnChainTableData[];
    total: number;
  } {
    return {
      data: response.results.map(backendData => {
        const fromToken = {
          symbol: backendData.from_token.symbol,

          image: backendData.from_token.logo_url,
          amount: Web3Pure.fromWei(backendData.from_amount, backendData.from_token.decimals)
        };

        const toToken = {
          symbol: backendData.to_token.symbol,
          image: backendData.to_token.logo_url,
          amount: Web3Pure.fromWei(backendData.to_amount, backendData.to_token.decimals)
        };

        const blockchainName = FROM_BACKEND_BLOCKCHAINS[backendData.network];
        const blockchain = {
          name: blockchainName,
          label: blockchainLabel[blockchainName],
          color: blockchainColor[blockchainName],
          image: blockchainIcon[blockchainName]
        };

        const tx = {
          hash: backendData.transaction.hash,
          status: txStatusMapping[backendData.status],
          explorerLink: backendData.transaction.explorer_url
        };

        const searchedProvider = Object.entries(BACKEND_PROVIDERS).find(
          ([, value]) => value === backendData.provider
        )?.[0];

        const provider = TRADES_PROVIDERS[searchedProvider as TradeProvider];

        return {
          fromToken,
          toToken,
          blockchain,
          tx,
          date: backendData.created_at,
          provider
        };
      }),
      total: response.count
    };
  }

  private transformCrossChainResponse(response: CrossChainTableResponse): {
    data: CrossChainTableData[];
    total: number;
  } {
    return {
      data: response.results.map(backendData => {
        const fromToken = {
          symbol: backendData.from_token.symbol,

          image: backendData.from_token.logo_url,
          amount: Web3Pure.fromWei(backendData.from_amount, backendData.from_token.decimals)
        };

        const toToken = {
          symbol: backendData.to_token.symbol,
          image: backendData.to_token.logo_url,
          amount: Web3Pure.fromWei(backendData.to_amount, backendData.to_token.decimals)
        };

        const fromBlockchainName = FROM_BACKEND_BLOCKCHAINS[backendData.from_network];
        const fromBlockchain = {
          name: fromBlockchainName,
          label: blockchainLabel[fromBlockchainName],
          color: blockchainColor[fromBlockchainName],
          image: blockchainIcon[fromBlockchainName]
        };

        const toBlockchainName = FROM_BACKEND_BLOCKCHAINS[backendData.to_network];
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

        const provider = TRADES_PROVIDERS[backendData.provider as TradeProvider];

        return {
          fromToken,
          toToken,
          fromBlockchain,
          toBlockchain,
          fromTx,
          toTx,
          date: backendData.created_at,
          provider
        };
      }),
      total: response.count
    };
  }
}
