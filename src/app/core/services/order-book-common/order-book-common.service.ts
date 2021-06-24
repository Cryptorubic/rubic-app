import { Injectable } from '@angular/core';
import { OrderBookTradeData } from '../../../features/order-book-trade-page-old/models/trade-data';
import { Web3Public } from '../blockchain/web3-public-service/Web3Public';
import { Web3PublicService } from '../blockchain/web3-public-service/web3-public.service';
import { ORDER_BOOK_CONTRACT } from '../../../shared/constants/order-book/smart-contract';
import { ContractParameters } from './models/ContractParameters';

@Injectable({
  providedIn: 'root'
})
export class OrderBookCommonService {
  constructor(private web3PublicService: Web3PublicService) {}

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

  public async setAmountContributed(tradeData: OrderBookTradeData): Promise<OrderBookTradeData> {
    // const web3Public: Web3Public = this.web3PublicService[tradeData.blockchain];
    // const { contractAddress, contractAbi } = this.getContractParameters(tradeData);
    //
    // const fromTokensContributed: string = await web3Public.callContractMethod(
    //   contractAddress,
    //   contractAbi,
    //   'baseRaised',
    //   {
    //     methodArguments: [tradeData.memo]
    //   }
    // );
    // tradeData.token.from.amountContributed = Web3PublicService.tokenWeiToAmount(
    //   tradeData.token.from,
    //   fromTokensContributed
    // );
    //
    // const toTokensContributed: string = await web3Public.callContractMethod(
    //   contractAddress,
    //   contractAbi,
    //   'quoteRaised',
    //   {
    //     methodArguments: [tradeData.memo]
    //   }
    // );
    // tradeData.token.to.amountContributed = Web3PublicService.tokenWeiToAmount(
    //   tradeData.token.to,
    //   toTokensContributed
    // );
    //
    // return tradeData;
    return null;
  }
}
