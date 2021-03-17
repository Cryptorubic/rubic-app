import { Injectable } from '@angular/core';
import {
  ORDER_BOOK_TRADE_STATUS,
  OrderBookTradeData
} from 'src/app/shared/models/order-book/trade-page';
import { Web3Public } from 'src/app/core/services/blockchain/web3-public-service/Web3Public';
import { ORDER_BOOK_CONTRACT } from 'src/app/shared/constants/order-book/smart-contract';
import { Web3PublicService } from 'src/app/core/services/blockchain/web3-public-service/web3-public.service';

interface Web3PublicParameters {
  web3Public: Web3Public;
  contractAddress: string;
  contractAbi: any[];
}

@Injectable()
export class OrderBookTradeService {
  constructor(private web3PublicService: Web3PublicService) {}

  private getWeb3PublicParameters(tradeData: OrderBookTradeData): Web3PublicParameters {
    const web3Public: Web3Public = this.web3PublicService[tradeData.blockchain];

    const { contractAddress } = tradeData;
    const contractVersion = ORDER_BOOK_CONTRACT.ADDRESSES.findIndex(addresses =>
      Object.values(addresses)
        .map(a => a.toLowerCase())
        .includes(contractAddress.toLowerCase())
    );
    const contractAbi = ORDER_BOOK_CONTRACT.ABI[contractVersion];

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
