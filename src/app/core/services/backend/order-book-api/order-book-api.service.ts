import { Injectable } from '@angular/core';
import { List } from 'immutable';
import { from, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import SwapToken from 'src/app/shared/models/tokens/SwapToken';
import {
  OrderBookDataToken,
  OrderBookTradeData,
  ORDER_BOOK_TRADE_STATUS
} from 'src/app/features/order-book-trade-page/models/trade-data';
import { TokenPart } from 'src/app/shared/models/order-book/tokens';
import * as moment from 'moment';
import { HttpService } from '../../http/http.service';
import { TokensService } from '../tokens-service/tokens.service';
import { Web3Public } from '../../blockchain/web3-public-service/Web3Public';
import { Web3PublicService } from '../../blockchain/web3-public-service/web3-public.service';
import { OrderBookTradeApi } from './types/trade-api';
import { OrderBookTradeForm } from '../../../../features/swaps-page/order-books/models/trade-form';
import { OrderBookCommonService } from '../../order-book-common/order-book-common.service';
import { FROM_BACKEND_BLOCKCHAINS } from '../../../../shared/constants/blockchain/BACKEND_BLOCKCHAINS';
import { BOT_URL } from '../constants/BOT_URL';

interface PublicSwapsResponse extends OrderBookTradeApi {
  memo_contract: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrderBookApiService {
  private readonly PROD_ORIGIN = 'https://rubic.exchange';

  private readonly TEST_ORIGIN = 'https://devswaps.mywish.io';

  private _tokens: List<SwapToken>;

  constructor(
    private readonly httpService: HttpService,
    private readonly tokensService: TokensService,
    private readonly web3PublicService: Web3PublicService,
    private readonly orderBookCommonService: OrderBookCommonService
  ) {
    this.tokensService.tokens.subscribe(tokens => {
      this._tokens = tokens;
    });
  }

  public createTrade(tradeInfo: OrderBookTradeApi): Promise<{ unique_link: string }> {
    return this.httpService.post('create_swap3/', tradeInfo).toPromise();
  }

  public getTradeData(uniqueLink: string): Observable<OrderBookTradeData> {
    return this.httpService
      .get(`get_swap3_for_unique_link/${uniqueLink}`)
      .pipe(
        switchMap((tradeApi: OrderBookTradeApi) =>
          from(this.tradeApiToTradeData(tradeApi, uniqueLink))
        )
      );
  }

  public fetchPublicSwaps(): Observable<Promise<OrderBookTradeData>[]> {
    return this.httpService.get('get_public_swap3/').pipe(
      map((swaps: OrderBookTradeApi[]) => {
        return swaps.map(async swap => {
          const tradeData = await this.tradeApiToTradeData(swap, swap.unique_link);
          try {
            await this.setAmountContributed(tradeData);
          } catch (err) {
            console.error(err);
          }
          return tradeData;
        });
      })
    );
  }

  public async setAmountContributed(tradeData: OrderBookTradeData): Promise<OrderBookTradeData> {
    return this.orderBookCommonService.setAmountContributed(tradeData);
  }

  public async tradeApiToTradeData(
    tradeApi: OrderBookTradeApi | PublicSwapsResponse,
    uniqueLink: string
  ): Promise<OrderBookTradeData> {
    const tradeData = {
      memo: (<OrderBookTradeApi>tradeApi).memo ?? (<PublicSwapsResponse>tradeApi).memo_contract,
      contractAddress: tradeApi.contract_address,
      uniqueLink,

      token: {
        from: undefined,
        to: undefined
      },
      blockchain: FROM_BACKEND_BLOCKCHAINS[tradeApi.network],
      expirationDate: moment.utc(tradeApi.stop_date),
      isPublic: tradeApi.public,
      isWithBrokerFee: tradeApi.broker_fee,
      brokerAddress: tradeApi.broker_fee_address,
      status: ORDER_BOOK_TRADE_STATUS[tradeApi.state]
    } as OrderBookTradeData;
    await this.setTokensData('from', tradeApi, tradeData);
    await this.setTokensData('to', tradeApi, tradeData);

    return tradeData;
  }

  private async setTokensData(
    tokenPart: TokenPart,
    tradeApi: OrderBookTradeApi,
    tradeData: OrderBookTradeData
  ): Promise<void> {
    const tokenPartApi = tokenPart === 'from' ? 'base' : 'quote';

    tradeData.token[tokenPart] = {
      blockchain: tradeData.blockchain,
      address: tradeApi[`${tokenPartApi}_address`]
    } as OrderBookDataToken;

    const foundToken = this._tokens.find(
      t =>
        t.blockchain === tradeData.blockchain &&
        t.address.toLowerCase() === tradeData.token[tokenPart].address.toLowerCase()
    );
    if (foundToken) {
      tradeData.token[tokenPart] = { ...tradeData.token[tokenPart], ...foundToken };
    } else {
      const web3Public: Web3Public = this.web3PublicService[tradeData.blockchain];
      tradeData.token[tokenPart] = {
        ...tradeData.token[tokenPart],
        ...(await web3Public.getTokenInfo(tradeData.token[tokenPart].address))
      };
    }

    tradeData.token[tokenPart] = {
      ...tradeData.token[tokenPart],
      amountTotal: Web3PublicService.tokenWeiToAmount(
        tradeData.token[tokenPart],
        tradeApi[`${tokenPartApi}_limit`]
      ),
      minContribution: Web3PublicService.tokenWeiToAmount(
        tradeData.token[tokenPart],
        tradeApi[`min_${tokenPartApi}_wei`]
      ),
      brokerPercent: tradeApi[`broker_fee_${tokenPartApi}`]
    };
  }

  public notifyOrderBooksBotOnCreate(
    tradeForm: OrderBookTradeForm,
    uniqueLink: string,
    walletAddress: string,
    transactionHash: string
  ) {
    const tradeBot = {
      blockchain: tradeForm.blockchain,
      walletAddress,
      txHash: transactionHash,
      link: `${
        window.location.origin === this.PROD_ORIGIN ? this.PROD_ORIGIN : this.TEST_ORIGIN
      }/trades/public-v3/${uniqueLink}`,
      amountFrom: tradeForm.token.from.amount,
      amountTo: tradeForm.token.to.amount,
      symbolFrom: tradeForm.token.from.symbol,
      symbolTo: tradeForm.token.to.symbol
    };

    this.httpService.post(`${BOT_URL.ORDER_BOOKS}/create`, tradeBot).subscribe();
  }

  public notifyOrderBooksBotOnContribute(
    token: OrderBookDataToken,
    amount: string,
    uniqueLink: string,
    walletAddress: string,
    transactionHash: string
  ) {
    const tradeBot = {
      blockchain: token.blockchain,
      walletAddress,
      txHash: transactionHash,
      link: `${
        window.location.origin === this.PROD_ORIGIN ? this.PROD_ORIGIN : this.TEST_ORIGIN
      }/trades/public-v3/${uniqueLink}`,
      typeName: 'contribute',
      amount,
      symbol: token.symbol
    };

    this.httpService.post(`${BOT_URL.ORDER_BOOKS}/contribute`, tradeBot).subscribe();
  }

  public notifyOrderBooksBotOnWithdraw(
    token: OrderBookDataToken,
    uniqueLink: string,
    walletAddress: string,
    transactionHash: string
  ) {
    const tradeBot = {
      blockchain: token.blockchain,
      walletAddress,
      txHash: transactionHash,
      link: `${
        window.location.origin === this.PROD_ORIGIN ? this.PROD_ORIGIN : this.TEST_ORIGIN
      }/trades/public-v3/${uniqueLink}`,
      typeName: 'withdraw',
      symbol: token.symbol
    };

    this.httpService.post(`${BOT_URL.ORDER_BOOKS}/contribute`, tradeBot).subscribe();
  }
}
