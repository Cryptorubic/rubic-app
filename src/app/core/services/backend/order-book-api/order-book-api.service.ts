import { Injectable, OnDestroy } from '@angular/core';
import { List } from 'immutable';
import { from, Observable, Subscription } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import SwapToken from 'src/app/shared/models/tokens/SwapToken';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import {
  OrderBookDataToken,
  OrderBookTradeData
} from 'src/app/features/order-book-trade-page/types/trade-data';
import { TokenPart } from 'src/app/shared/models/order-book/tokens';
import * as moment from 'moment';
import { OrderBooksTableService } from 'src/app/features/swaps-page/order-books/components/order-books-table/services/order-books-table.service';
import { HttpService } from '../../http/http.service';
import { TokensService } from '../tokens-service/tokens.service';
import { Web3Public } from '../../blockchain/web3-public-service/Web3Public';
import { Web3PublicService } from '../../blockchain/web3-public-service/web3-public.service';
import { OrderBookTradeApi } from './types/trade-api';

@Injectable({
  providedIn: 'root'
})
export class OrderBookApiService implements OnDestroy {
  private _tokens: List<SwapToken>;

  private _tokensSubscription$: Subscription;

  constructor(
    private httpService: HttpService,
    private tokensService: TokensService,
    private web3PublicService: Web3PublicService,
    private orderBookTableService: OrderBooksTableService
  ) {
    this._tokensSubscription$ = this.tokensService.tokens.subscribe(tokens => {
      this._tokens = tokens;
    });
  }

  ngOnDestroy(): void {
    this._tokensSubscription$.unsubscribe();
  }

  public createTrade(tradeInfo: OrderBookTradeApi): Promise<OrderBookTradeApi> {
    return this.httpService.post('create_swap3/', tradeInfo).toPromise();
  }

  public getTradeData(uniqueLink: string): Observable<OrderBookTradeData> {
    return this.httpService
      .get('get_swap3_for_unique_link/', {
        unique_link: uniqueLink
      })
      .pipe(switchMap((tradeApi: OrderBookTradeApi) => from(this.tradeApiToTradeData(tradeApi))));
  }

  public fetchPublicSwap3(): void {
    this.httpService
      .get('get_public_swap3/')
      .pipe(
        map((swaps: OrderBookTradeApi[]) => {
          return swaps.map(swap => this.tradeApiToTradeData(swap));
        })
      )
      .subscribe(async tradeData => {
        this.orderBookTableService.setTableData(await Promise.all(tradeData));
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
      memo: tradeApi.memo_contract,
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

    const foundToken = this._tokens.find(
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
}
