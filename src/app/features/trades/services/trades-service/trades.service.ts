import { Injectable } from '@angular/core';
import { List } from 'immutable';
import * as moment from 'moment';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { OrderBookTradeApi } from 'src/app/core/services/backend/order-book-api/types/trade-api';
import { TokensService } from 'src/app/core/services/backend/tokens-service/tokens.service';
import { Web3PublicService } from 'src/app/core/services/blockchain/web3-public-service/web3-public.service';
import { Web3Public } from 'src/app/core/services/blockchain/web3-public-service/Web3Public';
import { HttpService } from 'src/app/core/services/http/http.service';
import {
  OrderBookTradeData,
  OrderBookDataToken
} from 'src/app/features/order-book-trade-page/models/trade-data';

import { OrderBookTradeTableRow } from 'src/app/features/swaps-page/order-books/types/trade-table';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { TokenPart } from 'src/app/shared/models/order-book/tokens';
import SwapToken from 'src/app/shared/models/tokens/SwapToken';

@Injectable({
  providedIn: 'root'
})
export class TradesService {
  private readonly $dataSource: BehaviorSubject<OrderBookTradeTableRow[]>;

  private readonly $visibleTableData: BehaviorSubject<OrderBookTradeTableRow[]>;

  private readonly $displayedColumns: BehaviorSubject<string[]>;

  private readonly $columnsSizes: BehaviorSubject<string[]>;

  private readonly $filterBaseValue: BehaviorSubject<any>;

  private readonly $filterQuoteValue: BehaviorSubject<any>;

  private readonly $tokens: BehaviorSubject<List<SwapToken>>;

  private readonly $tableLoadingStatus: BehaviorSubject<boolean>;

  constructor(
    private readonly httpService: HttpService,
    private readonly web3PublicService: Web3PublicService,
    private readonly tokensService: TokensService
  ) {
    this.$tableLoadingStatus = new BehaviorSubject<boolean>(false);
    this.$filterBaseValue = new BehaviorSubject<any>(null);
    this.$tokens = this.tokensService.tokens;
    this.$filterBaseValue = new BehaviorSubject<any>(null);
    this.$filterQuoteValue = new BehaviorSubject<any>(null);
    this.$dataSource = new BehaviorSubject<OrderBookTradeTableRow[]>([]);
    this.$visibleTableData = new BehaviorSubject<OrderBookTradeTableRow[]>([]);
    this.$displayedColumns = new BehaviorSubject<string[]>([
      'status',
      'token',
      'amount',
      'network',
      'expires'
    ]);
    this.$columnsSizes = new BehaviorSubject<string[]>(['10%', '15%', '50%', '10%', '15%']);
  }

  public getTableData(): Observable<any> {
    return this.$visibleTableData.asObservable();
  }

  public setTableData(value: any): void {
    this.$dataSource.next(value);
    this.$visibleTableData.next(value);
    this.$tableLoadingStatus.next(false);
  }

  public getTableColumns(): Observable<string[]> {
    return this.$displayedColumns.asObservable();
  }

  public getTableColumnsSizes(): Observable<string[]> {
    return this.$columnsSizes.asObservable();
  }

  public getBaseTokenFilter(): Observable<any> {
    return this.$filterBaseValue.asObservable();
  }

  public setBaseTokenFilter(value: any): void {
    this.$filterBaseValue.next(value);
  }

  public getQuoteTokenFilter(): Observable<any> {
    return this.$filterQuoteValue.asObservable();
  }

  public setQuoteTokenFilter(value: any): void {
    this.$filterQuoteValue.next(value);
  }

  public filterByToken(token: any, tokenType: 'quote' | 'base'): void {
    const filterValue = token.option.value.toLowerCase();
    if (filterValue.length < 2) {
      this.$visibleTableData.next(this.$dataSource.value);
    } else {
      const filteredData = this.$dataSource.value.filter(
        row => row.token[tokenType].symbol.toLowerCase() === filterValue
      );
      this.$visibleTableData.next(filteredData);
    }
  }

  public fetchSwaps(): void {
    this.httpService
      .get('get_user_swap3/')
      .pipe(
        map((swaps: OrderBookTradeApi[]) => {
          return swaps.map(swap => this.tradeApiToTradeData(swap));
        })
      )
      .subscribe(async tradeData => {
        this.setTableData(await Promise.all(tradeData));
      });
  }

  public async tradeApiToTradeData(tradeApi: OrderBookTradeApi): Promise<OrderBookTradeData> {
    let blockchain;
    switch (tradeApi.network) {
      case 1:
        blockchain = BLOCKCHAIN_NAME.ETHEREUM;
        break;
      case 22:
        blockchain = BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN;
        break;
      case 24:
        blockchain = BLOCKCHAIN_NAME.MATIC;
      // no default
    }

    const tradeData = {
      memo: (tradeApi as any).memo_contract,
      contractAddress: tradeApi.contract_address,

      token: {
        base: undefined,
        quote: undefined
      },
      blockchain,
      expirationDate: moment.utc(tradeApi.stop_date),
      isPublic: tradeApi.public,
      isWithBrokerFee: tradeApi.broker_fee,
      brokerAddress: tradeApi.broker_fee_address,
      uniqueLink: tradeApi.unique_link,
      status: tradeApi.state
    } as OrderBookTradeData;
    await this.setTokensData('base', tradeApi, tradeData);
    await this.setTokensData('quote', tradeApi, tradeData);

    return tradeData;
  }

  private async setTokensData(
    tokenPart: TokenPart,
    tradeApi: OrderBookTradeApi,
    tradeData: OrderBookTradeData
  ): Promise<void> {
    tradeData.token[tokenPart] = {
      address: tradeApi[`${tokenPart}_address`]
    } as OrderBookDataToken;
    const foundToken = this.$tokens.value.find(
      t => t.blockchain === tradeData.blockchain && t.address === tradeData.token[tokenPart].address
    );
    if (foundToken) {
      tradeData.token[tokenPart] = { ...tradeData.token[tokenPart], ...foundToken };
    } else {
      try {
        const web3Public: Web3Public = this.web3PublicService[tradeData.blockchain];
        tradeData.token[tokenPart] = {
          ...tradeData.token[tokenPart],
          ...(await web3Public.getTokenInfo(tradeData.token[tokenPart].address))
        };
      } catch (err) {
        console.error(err);
      }
    }

    tradeData.token[tokenPart] = {
      ...tradeData.token[tokenPart],
      amountTotal: Web3PublicService.tokenWeiToAmount(
        tradeData.token[tokenPart],
        tradeApi[`${tokenPart}_limit`]
      ),
      minContribution: Web3PublicService.tokenWeiToAmount(
        tradeData.token[tokenPart],
        tradeApi[`min_${tokenPart}_wei`]
      ),
      brokerPercent: tradeApi[`broker_fee_${tokenPart}`]
    };
  }

  public setTableLoadingStatus(value: boolean): void {
    this.$tableLoadingStatus.next(value);
  }

  public getTableLoadingStatus(): Observable<boolean> {
    return this.$tableLoadingStatus.asObservable();
  }
}
