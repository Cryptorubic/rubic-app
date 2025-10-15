import { Injectable } from '@angular/core';
import { combineLatest, combineLatestWith, Observable, timer } from 'rxjs';
import { TableKey } from '@features/history/models/table-key';
import { debounceTime, filter, map, share, startWith, switchMap, takeUntil } from 'rxjs/operators';
import { tuiIsFalsy, tuiIsPresent } from '@taiga-ui/cdk';
import { HttpService } from '@core/services/http/http.service';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import { BackendBlockchain, FROM_BACKEND_BLOCKCHAINS, Web3Pure } from '@cryptorubic/sdk';
import { blockchainIcon } from '@shared/constants/blockchain/blockchain-icon';
import { blockchainColor } from '@shared/constants/blockchain/blockchain-color';
import { blockchainLabel } from '@shared/constants/blockchain/blockchain-label';
import { TRADES_PROVIDERS } from '@features/trade/constants/trades-providers';
import { TradeProvider } from '@features/trade/models/trade-provider';
import { txStatusMapping } from '@features/history/models/tx-status-mapping';
import { OnChainTableData } from '@features/history/models/on-chain-table-data';
import { OnChainTableResponse } from '@features/history/models/on-chain-table-response';
import { OnChainTableRequest } from '@features/history/models/on-chain-table-request';
import { TableService } from '@features/history/models/table-service';
import { TO_BACKEND_ON_CHAIN_PROVIDERS } from '@cryptorubic/core';

@Injectable()
export class OnChainTableService extends TableService<
  'created_at',
  OnChainTableResponse,
  OnChainTableData
> {
  public readonly addressChange$ = this.walletConnector.addressChange$;

  public readonly request$ = combineLatest([
    this.addressChange$,
    this.sorter$,
    this.direction$,
    this.page$,
    this.size$
  ]).pipe(
    // zero time debounce for a case when both key and direction change
    debounceTime(50),
    switchMap(([_, ...query]) =>
      timer(0, 30_000).pipe(
        switchMap(() => this.getData(...query).pipe(startWith(null))),
        takeUntil(this.activeItemIndex$.pipe(filter(activeItem => activeItem !== 1)))
      )
    ),
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

  public readonly data$ = this.request$.pipe(
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
    pageSze: number
  ): Observable<{
    data: OnChainTableData[];
    total: number;
  }> {
    const address = this.walletConnector.address;

    const params: OnChainTableRequest = {
      address,
      page: page + 1,
      pageSize: pageSze,
      ordering: direction === -1 ? `-${key}` : key
    };

    return this.httpService
      .get<OnChainTableResponse>(`v2/trades/onchain`, params)
      .pipe(map(response => this.transformResponse(response)));
  }

  protected transformResponse(response: OnChainTableResponse): {
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

        const blockchainName = FROM_BACKEND_BLOCKCHAINS[backendData.network as BackendBlockchain];
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

        const searchedProvider = Object.entries(TO_BACKEND_ON_CHAIN_PROVIDERS).find(
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
}
