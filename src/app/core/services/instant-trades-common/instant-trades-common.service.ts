import { Injectable } from '@angular/core';
import { InstantTradesTradeData } from 'src/app/features/swaps-page/models/trade-data';
import { INSTANT_TRADES_CONTRACT } from 'src/app/shared/constants/instant-trades/smart-contract';
import { Web3PublicService } from '../blockchain/web3-public-service/web3-public.service';
import { Web3Public } from '../blockchain/web3-public-service/Web3Public';
import { ContractParameters } from './models/ContractParameters';

@Injectable({
  providedIn: 'root'
})
export class InstantTradesCommonService {
  constructor(private web3PublicService: Web3PublicService) {}

  private getContractParameters(tradeData: InstantTradesTradeData): ContractParameters {
    const { contractAddress } = tradeData;
    const contractVersion = INSTANT_TRADES_CONTRACT.ADDRESSES.findIndex(addresses =>
      Object.values(addresses)
        .map(a => a.toLowerCase())
        .includes(contractAddress.toLowerCase())
    );
    const contractAbi = INSTANT_TRADES_CONTRACT.ABI[contractVersion];

    return {
      contractAddress,
      contractAbi
    };
  }

  public async setAmountContributed(
    tradeData: InstantTradesTradeData
  ): Promise<InstantTradesTradeData> {
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
}
