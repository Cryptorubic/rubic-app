import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import * as moment from 'moment';
import { TokenPart } from 'src/app/shared/models/order-book/tokens';
import SwapToken from 'src/app/shared/models/tokens/SwapToken';
import { List } from 'immutable';
import BigNumber from 'bignumber.js';
import {
  InstantTradesTradeData,
  INTSTANT_TRADES_TRADE_STATUS
} from 'src/app/features/swaps-page/models/trade-data';
import { InstantTradesDataToken } from 'src/app/features/order-book-trade-page/models/trade-data';
import { HttpService } from '../../http/http.service';
import { BLOCKCHAIN_NAME } from '../../../../shared/models/blockchain/BLOCKCHAIN_NAME';
import InstantTrade from '../../../../features/swaps-page/instant-trades/models/InstantTrade';
import { InstantTradesTradeApi } from './types/trade-api';
import { Web3Public } from '../../blockchain/web3-public-service/Web3Public';
import { Web3PublicService } from '../../blockchain/web3-public-service/web3-public.service';
import { InstantTradesCommonService } from '../../instant-trades-common/instant-trades-common.service';
import { TokensService } from '../tokens-service/tokens.service';
@Injectable({
  providedIn: 'root'
})
export class InstantTradesApiService {
  private readonly botUrl = 'bot/instanttrades';

  private _tokens: List<SwapToken>;

  constructor(
    private httpService: HttpService,
    private readonly tokensService: TokensService,
    private readonly web3PublicService: Web3PublicService,
    private readonly instantTradesCommonService: InstantTradesCommonService
  ) {
    this.tokensService.tokens.subscribe(tokens => {
      this._tokens = tokens;
    });
  }

  public notifyInstantTradesBot(body: {
    provider: string;
    blockchain: BLOCKCHAIN_NAME;
    walletAddress: string;
    trade: InstantTrade;
    txHash: string;
  }): Promise<void> {
    const { trade, ...props } = body;
    const req = {
      ...props,
      amountFrom: trade.from.amount,
      amountTo: trade.to.amount,
      symbolFrom: trade.from.token.symbol,
      symbolTo: trade.to.token.symbol
    };

    return this.httpService.post(this.botUrl, req).toPromise();
  }

  public createTrade(tradeInfo: InstantTradesTradeApi): Promise<{ unique_link: string }> {
    return this.httpService.post('trades/', tradeInfo).toPromise();
  }

  public fetchSwaps(): Observable<InstantTradesTradeData[]> {
    return this.httpService.get('trades/').pipe(
      map((swaps: InstantTradesTradeApi[]) => {
        return swaps.map(async swap => {
          const tradeData = await this.tradeApiToTradeData(swap);
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

  public async setAmountContributed(
    tradeData: InstantTradesTradeData
  ): Promise<InstantTradesTradeData> {
    return this.instantTradesCommonService.setAmountContributed(tradeData);
  }

  public async tradeApiToTradeData(
    tradeApi: InstantTradesTradeApi
  ): Promise<InstantTradesTradeData> {
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
      memo: 'str',
      network: blockchain
    } as InstantTradesTradeData;
    await this.setTokensData('base', tradeApi, tradeData);
    await this.setTokensData('quote', tradeApi, tradeData);

    return tradeData;
  }

  private async setTokensData(
    tokenPart: TokenPart,
    tradeApi: InstantTradesTradeApi,
    tradeData: InstantTradesTradeData
  ): Promise<void> {
    tradeData.token[tokenPart] = {
      blockchain: tradeData.blockchain,
      address: tradeApi[`${tokenPart}_address`]
    } as InstantTradesDataToken;

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
