import { Injectable } from '@angular/core';
import { Web3Public } from 'src/app/core/services/blockchain/web3-public-service/Web3Public';
import { ORDER_BOOK_CONTRACT } from 'src/app/shared/constants/order-book/smart-contract';
import { Web3PublicService } from 'src/app/core/services/blockchain/web3-public-service/web3-public.service';
import BigNumber from 'bignumber.js';
import { TransactionReceipt } from 'web3-eth';
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

  public async setAllowance(tradeData: OrderBookTradeData): Promise<void> {
    await this.setAllowanceToToken(tradeData, 'base');
    await this.setAllowanceToToken(tradeData, 'quote');
  }

  private async setAllowanceToToken(
    tradeData: OrderBookTradeData,
    tokenPart: TokenPart
  ): Promise<void> {
    const web3Public: Web3Public = this.web3PublicService[tradeData.blockchain];
    if (web3Public.isNativeAddress(tradeData.token[tokenPart].address)) {
      tradeData.token[tokenPart].isApproved = true;
    } else {
      tradeData.token[tokenPart].isApproved = (
        await this.getAllowance(tradeData, tokenPart)
      ).isGreaterThan(0);
    }
  }

  private async getAllowance(
    tradeData: OrderBookTradeData,
    tokenPart: TokenPart
  ): Promise<BigNumber> {
    const web3Public: Web3Public = this.web3PublicService[tradeData.blockchain];
    const { contractAddress } = this.getContractParameters(tradeData);

    return web3Public.getAllowance(
      tradeData.token[tokenPart].address,
      this.web3PrivateService.address,
      contractAddress
    );
  }

  public makeApprove(
    tradeData: OrderBookTradeData,
    tokenPart: TokenPart,
    onTransactionHash: (hash: string) => void
  ): Promise<TransactionReceipt> {
    const { contractAddress } = this.getContractParameters(tradeData);

    // eslint-disable-next-line no-magic-numbers
    const amountToApprove = new BigNumber(2).pow(256).minus(1);
    return this.web3PrivateService.approveTokens(
      tradeData.token[tokenPart].address,
      contractAddress,
      amountToApprove,
      {
        onTransactionHash
      }
    );
  }

  public async makeApproveOrContribute(
    tradeData: OrderBookTradeData,
    tokenPart: TokenPart,
    amount: string,
    onTransactionHash: (hash: string) => void
  ): Promise<TransactionReceipt> {
    const web3Public: Web3Public = this.web3PublicService[tradeData.blockchain];

    if (!web3Public.isNativeAddress(tradeData.token[tokenPart].address)) {
      const allowance = await this.getAllowance(tradeData, tokenPart);
      const amountToContribute = new BigNumber(
        Web3PublicService.tokenAmountToWei(tradeData.token[tokenPart], amount)
      );

      if (amountToContribute.isGreaterThan(allowance)) {
        return this.makeApprove(tradeData, tokenPart, onTransactionHash);
      }
    }
    return this.makeContribute(tradeData, tokenPart, amount, onTransactionHash);
  }

  private async makeContribute(
    tradeData: OrderBookTradeData,
    tokenPart: TokenPart,
    amount: string,
    onTransactionHash: (hash: string) => void
  ): Promise<TransactionReceipt> {
    const web3Public: Web3Public = this.web3PublicService[tradeData.blockchain];
    const { contractAddress, contractAbi } = this.getContractParameters(tradeData);

    const value = Web3PublicService.tokenAmountToWei(tradeData.token[tokenPart], amount);
    return this.web3PrivateService.executeContractMethod(
      contractAddress,
      contractAbi,
      'deposit',
      [tradeData.memo, tradeData.token[tokenPart].address, value],
      {
        onTransactionHash,
        value: web3Public.isNativeAddress(tradeData.token[tokenPart].address) ? value : undefined
      }
    );
  }

  public async makeWithdraw(
    tradeData: OrderBookTradeData,
    tokenPart: TokenPart,
    onTransactionHash: (hash: string) => void
  ): Promise<TransactionReceipt> {
    const { contractAddress, contractAbi } = this.getContractParameters(tradeData);

    return this.web3PrivateService.executeContractMethod(
      contractAddress,
      contractAbi,
      'refund',
      [tradeData.memo, tradeData.token[tokenPart].address],
      {
        onTransactionHash
      }
    );
  }
}
