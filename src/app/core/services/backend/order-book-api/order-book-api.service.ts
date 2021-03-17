import { Injectable, OnDestroy } from '@angular/core';
import { List } from 'immutable';
import { from, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { OrderBookTradeApi } from 'src/app/shared/models/order-book/trade-api';
import SwapToken from 'src/app/shared/models/tokens/SwapToken';
import { OrderBookTradeData } from 'src/app/shared/models/order-book/trade-page';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { OrderBookDataToken, TokenPart } from 'src/app/shared/models/order-book/tokens';
import { HttpService } from '../../http/http.service';
import { TokensService } from '../tokens-service/tokens.service';
import { Web3Public } from '../../blockchain/web3-public-service/Web3Public';
import { Web3PublicService } from '../../blockchain/web3-public-service/web3-public.service';

@Injectable({
  providedIn: 'root'
})
export class OrderBookApiService implements OnDestroy {
  private _tokens: List<SwapToken>;

  constructor(
    private httpService: HttpService,
    private orderBookApiService: OrderBookApiService,
    private tokensService: TokensService,
    private web3PublicService: Web3PublicService
  ) {
    this.tokensService.tokens.subscribe(tokens => {
      this._tokens = tokens;
    });
  }

  ngOnDestroy() {
    this.tokensService.tokens.unsubscribe();
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

      token: {},
      blockchain,
      expirationDate: new Date(tradeApi.stop_date),
      isPublic: tradeApi.public
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

    const foundToken = this._tokens.find(t => t.address === tradeData.token[tokenPart].address);
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
