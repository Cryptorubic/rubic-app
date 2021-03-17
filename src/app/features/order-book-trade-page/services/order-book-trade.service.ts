import { Injectable } from '@angular/core';
import { Web3Public } from 'src/app/core/services/blockchain/web3-public-service/Web3Public';
import { ORDER_BOOK_CONTRACT } from 'src/app/shared/constants/order-book/smart-contract';
import { Web3PublicService } from 'src/app/core/services/blockchain/web3-public-service/web3-public.service';
import { ORDER_BOOK_TRADE_STATUS, OrderBookTradeData } from '../types/trade-data';
import { Web3PrivateService } from '../../../core/services/blockchain/web3-private-service/web3-private.service';
import { TokenPart } from '../../../shared/models/order-book/tokens';

interface ContractParameters {
  contractAddress: string;
  contractAbi: any[];
}

@Injectable()
export class OrderBookTradeService {
  constructor(
    private web3PublicService: Web3PublicService,
    private web3PrivateService: Web3PrivateService
  ) {}

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

  public async setStatus(tradeData: OrderBookTradeData): Promise<void> {
    const web3Public: Web3Public = this.web3PublicService[tradeData.blockchain];
    const { contractAddress, contractAbi } = this.getContractParameters(tradeData);

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
  }

  public async setInvestorsNumber(tradeData: OrderBookTradeData): Promise<void> {
    const web3Public: Web3Public = this.web3PublicService[tradeData.blockchain];
    const { contractAddress, contractAbi } = this.getContractParameters(tradeData);

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

  public setAllowance(tradeData: OrderBookTradeData): void {
    this.setAllowanceToToken(tradeData, 'base');
    this.setAllowanceToToken(tradeData, 'quote');
  }

  private async setAllowanceToToken(tradeData: OrderBookTradeData, tokenPart: TokenPart) {
    const web3Public: Web3Public = this.web3PublicService[tradeData.blockchain];
    const { contractAddress } = this.getContractParameters(tradeData);

    const amount = await web3Public.getAllowance(
      tradeData.token[tokenPart].address,
      this.web3PrivateService.address,
      contractAddress
    );
    tradeData.token[tokenPart].isApproved = amount.isGreaterThan(0);
  }
}
