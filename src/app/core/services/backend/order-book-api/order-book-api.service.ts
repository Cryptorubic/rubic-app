import { Injectable } from '@angular/core';
import { List } from 'immutable';
import { from, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import SwapToken from 'src/app/shared/models/tokens/SwapToken';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import {
  OrderBookDataToken,
  OrderBookTradeData
} from 'src/app/features/order-book-trade-page/models/trade-data';
import { TokenPart } from 'src/app/shared/models/order-book/tokens';
import * as moment from 'moment';
import { OrderBooksTableService } from 'src/app/features/swaps-page/order-books/components/order-books-table/services/order-books-table.service';
import { ORDER_BOOK_CONTRACT } from 'src/app/shared/constants/order-book/smart-contract';
import { HttpService } from '../../http/http.service';
import { TokensService } from '../tokens-service/tokens.service';
import { Web3Public } from '../../blockchain/web3-public-service/Web3Public';
import { Web3PublicService } from '../../blockchain/web3-public-service/web3-public.service';
import { OrderBookTradeApi } from './types/trade-api';
import { OrderBookTradeForm } from '../../../../features/swaps-page/order-books/types/trade-form';

interface ContractParameters {
  contractAddress: string;
  contractAbi: any[];
}

@Injectable({
  providedIn: 'root'
})
export class OrderBookApiService {
  private readonly PROD_ORIGIN = 'https://rubic.exchange';

  private readonly TEST_ORIGIN = 'https://devswaps.mywish.io';

  private readonly botUrl = 'bot/orderbook';

  private _tokens: List<SwapToken>;

  constructor(
    private readonly httpService: HttpService,
    private readonly tokensService: TokensService,
    private readonly web3PublicService: Web3PublicService,
    private readonly orderBookTableService: OrderBooksTableService
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
      .get('get_swap3_for_unique_link/', {
        unique_link: uniqueLink
      })
      .pipe(
        switchMap((tradeApi: OrderBookTradeApi) =>
          from(this.tradeApiToTradeData(tradeApi, uniqueLink))
        )
      );
  }

  public fetchPublicSwap3(): void {
    this.httpService
      .get('get_public_swap3/')
      .pipe(
        map((swaps: OrderBookTradeApi[]) => {
          return swaps.map(async swap => {
            const trade = await this.tradeApiToTradeData(swap, swap.unique_link);
            await this.setAmountContributed(trade);
            return trade;
          });
        })
      )
      .subscribe(async tradeData => {
        this.orderBookTableService.setTableData(await Promise.all(tradeData));
      });
  }

  public async setAmountContributed(tradeData: OrderBookTradeData): Promise<OrderBookTradeData> {
    const web3Public: Web3Public = this.web3PublicService[tradeData.blockchain];
    const { contractAddress, contractAbi } = this.getContractParameters(tradeData);

    const baseContributed: string = await web3Public.callContractMethod(
      contractAddress,
      contractAbi,
      'baseRaised',
      {
        methodArguments: [tradeData.memo]
      }
    );
    tradeData.token.base.amountContributed = Web3PublicService.tokenWeiToAmount(
      tradeData.token.base,
      baseContributed
    );

    const quoteContributed: string = await web3Public.callContractMethod(
      contractAddress,
      contractAbi,
      'quoteRaised',
      {
        methodArguments: [tradeData.memo]
      }
    );
    tradeData.token.quote.amountContributed = Web3PublicService.tokenWeiToAmount(
      tradeData.token.quote,
      quoteContributed
    );

    return tradeData;
  }

  public async tradeApiToTradeData(
    tradeApi: OrderBookTradeApi,
    uniqueLink: string
  ): Promise<OrderBookTradeData> {
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
      memo: tradeApi.memo,
      contractAddress: tradeApi.contract_address,
      uniqueLink,

      token: {
        base: undefined,
        quote: undefined
      },
      blockchain,
      expirationDate: moment.utc(tradeApi.stop_date),
      isPublic: tradeApi.public,
      isWithBrokerFee: tradeApi.broker_fee,
      brokerAddress: tradeApi.broker_fee_address
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
      blockchain: tradeData.blockchain,
      address: tradeApi[`${tokenPart}_address`]
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
        tradeApi[`${tokenPart}_limit`]
      ),
      minContribution: Web3PublicService.tokenWeiToAmount(
        tradeData.token[tokenPart],
        tradeApi[`min_${tokenPart}_wei`]
      ),
      brokerPercent: tradeApi[`broker_fee_${tokenPart}`]
    };
  }

  public createTradeBotNotification(
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
      amountFrom: tradeForm.token.base.amount,
      amountTo: tradeForm.token.quote.amount,
      symbolFrom: tradeForm.token.base.symbol,
      symbolTo: tradeForm.token.quote.symbol
    };

    this.httpService.post(`${this.botUrl}/create`, tradeBot).subscribe();
  }

  private getContractParameters(tradeData: OrderBookTradeData): ContractParameters {
    const { contractAddress } = tradeData;
    const contractVersion = ORDER_BOOK_CONTRACT.ADDRESSES.findIndex(addresses =>
      Object.values(addresses)
        .map(a => a.toLowerCase())
        .includes(contractAddress.toLowerCase())
    );
    const contractAbi = ORDER_BOOK_CONTRACT.ABI[contractVersion];

    return {
      contractAddress,
      contractAbi
    };
  }

  public contributeBotNotification(
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

    this.httpService.post(`${this.botUrl}/contribute`, tradeBot).subscribe();
  }

  public withdrawBotNotification(
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

    this.httpService.post(`${this.botUrl}/contribute`, tradeBot).subscribe();
  }
}
