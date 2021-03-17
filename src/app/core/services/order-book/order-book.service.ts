import { Injectable } from '@angular/core';
import BigNumber from 'bignumber.js';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { CONTRACT } from './smart-contract';
import { OrderBookApiService } from '../backend/order-book-api/order-book-api.service';
import { Web3Public } from '../blockchain/web3-public-service/Web3Public';
import { Web3PublicService } from '../blockchain/web3-public-service/web3-public.service';
import { OrderBookDataToken, TokenPart } from './types/tokens';
import { OrderBookTradeApi } from './types/trade-api';
import { ORDER_BOOK_TRADE_STATUS, OrderBookTradeData } from './types/trade-page';
import SwapToken from '../../../shared/models/tokens/SwapToken';

interface Web3PublicParameters {
  web3Public: Web3Public;
  contractAddress: string;
  contractAbi: any[];
}

@Injectable({
  providedIn: 'root'
})
export class OrderBookService {
  static readonly EMPTY_ADDRESS = '0x0000000000000000000000000000000000000000';

  constructor(
    private orderBookApiService: OrderBookApiService,
    private web3PublicService: Web3PublicService
  ) {}

  static tokenAmountToWei(token: SwapToken, amount: string | BigNumber): string {
    return new BigNumber(amount || '0').times(new BigNumber(10).pow(token.decimals)).toFixed(0);
  }

  private static tokenWeiToAmount(token: SwapToken, amount: string): BigNumber {
    return new BigNumber(amount).div(new BigNumber(10).pow(token.decimals));
  }

  public async getTradeData(uniqueLink: string): Promise<OrderBookTradeData> {
    const tradeInfoApi = await this.orderBookApiService.getTradeData(uniqueLink);

    let blockchain;
    switch (tradeInfoApi.network) {
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

    const expirationDate = new Date(tradeInfoApi.stop_date);

    const tradeData = {
      memo: tradeInfoApi.memo_contract,
      contractAddress: tradeInfoApi.contract_address,

      token: {
        base: {} as OrderBookDataToken,
        quote: {} as OrderBookDataToken
      },
      blockchain,
      expirationDate,
      isPublic: tradeInfoApi.public
    } as OrderBookTradeData;
    await this.setTokensData('base', tradeData, tradeInfoApi);
    await this.setTokensData('quote', tradeData, tradeInfoApi);

    return tradeData;
  }

  private async setTokensData(
    tokenPart: TokenPart,
    tradeData: OrderBookTradeData,
    tradeInfoApi: OrderBookTradeApi
  ): Promise<void> {
    tradeData.token[tokenPart].address = tradeInfoApi[`${tokenPart}_address`];

    const web3Public: Web3Public = this.web3PublicService[tradeData.blockchain];

    tradeData.token[tokenPart] = {
      ...tradeData.token[tokenPart],
      ...(await web3Public.getTokenInfo(tradeData.token[tokenPart].address))
    };

    tradeData.token[tokenPart] = {
      ...tradeData.token[tokenPart],
      amountTotal: OrderBookService.tokenWeiToAmount(
        tradeData.token[tokenPart],
        tradeInfoApi[`${tokenPart}_limit`]
      ),
      minContribution: OrderBookService.tokenWeiToAmount(
        tradeData.token[tokenPart],
        tradeInfoApi[`min_${tokenPart}_wei`]
      ),
      brokerPercent: tradeInfoApi[`broker_fee_${tokenPart}`]
    };
  }

  private getWeb3PublicParameters(tradeData: OrderBookTradeData): Web3PublicParameters {
    const web3Public: Web3Public = this.web3PublicService[tradeData.blockchain];

    const { contractAddress } = tradeData;
    const contractVersion = CONTRACT.ADDRESSES.findIndex(addresses =>
      Object.values(addresses)
        .map(a => a.toLowerCase())
        .includes(contractAddress.toLowerCase())
    );
    const contractAbi = CONTRACT.ABI[contractVersion];

    return {
      web3Public,
      contractAddress,
      contractAbi
    };
  }

  public async setStatus(tradeData: OrderBookTradeData): Promise<void> {
    const { web3Public, contractAddress, contractAbi } = this.getWeb3PublicParameters(tradeData);

    const { expirationDate } = tradeData;
    if (expirationDate <= new Date()) {
      tradeData.status = ORDER_BOOK_TRADE_STATUS.EXPIRED;
    } else {
      const isDone: boolean = await web3Public.callContractMethod(
        contractAddress,
        contractAbi,
        'isSwapped',
        {
          methodArguments: [tradeData.memo]
        }
      );

      if (isDone) {
        tradeData.status = ORDER_BOOK_TRADE_STATUS.DONE;
      } else {
        const isCancelled: boolean = await web3Public.callContractMethod(
          contractAddress,
          contractAbi,
          'isCancelled',
          {
            methodArguments: [tradeData.memo]
          }
        );

        if (isCancelled) {
          tradeData.status = ORDER_BOOK_TRADE_STATUS.CANCELLED;
        } else {
          tradeData.status = ORDER_BOOK_TRADE_STATUS.ACTIVE;
        }
      }
    }
  }

  public async setAmountContributed(tradeData: OrderBookTradeData): Promise<void> {
    const { web3Public, contractAddress, contractAbi } = this.getWeb3PublicParameters(tradeData);

    const baseContributed: string = await web3Public.callContractMethod(
      contractAddress,
      contractAbi,
      'baseRaised',
      {
        methodArguments: [tradeData.memo]
      }
    );
    tradeData.token.base.amountContributed = OrderBookService.tokenWeiToAmount(
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
    tradeData.token.quote.amountContributed = OrderBookService.tokenWeiToAmount(
      tradeData.token.quote,
      quoteContributed
    );
  }

  public async setInvestorsNumber(tradeData: OrderBookTradeData): Promise<void> {
    const { web3Public, contractAddress, contractAbi } = this.getWeb3PublicParameters(tradeData);

    const baseInvestors: string[] = await web3Public.callContractMethod(
      contractAddress,
      contractAbi,
      'baseInvestors',
      {
        methodArguments: [tradeData.memo]
      }
    );
    tradeData.token.base.investorsNumber = baseInvestors.length;

    const quoteInvestors: string[] = await web3Public.callContractMethod(
      contractAddress,
      contractAbi,
      'quoteInvestors',
      {
        methodArguments: [tradeData.memo]
      }
    );
    tradeData.token.quote.investorsNumber = quoteInvestors.length;
  }
}
