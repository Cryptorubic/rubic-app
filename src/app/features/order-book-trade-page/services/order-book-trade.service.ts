import { Injectable } from '@angular/core';
import { Web3Public } from 'src/app/core/services/blockchain/web3-public-service/Web3Public';
import { ORDER_BOOK_CONTRACT } from 'src/app/shared/constants/order-book/smart-contract';
import { Web3PublicService } from 'src/app/core/services/blockchain/web3-public-service/web3-public.service';
import BigNumber from 'bignumber.js';
import { TransactionReceipt } from 'web3-eth';
import * as moment from 'moment';
import { ProviderConnectorService } from 'src/app/core/services/blockchain/provider-connector/provider-connector.service';
import { Web3PrivateService } from 'src/app/core/services/blockchain/web3-private-service/web3-private.service';
import { TokenPart } from 'src/app/shared/models/order-book/tokens';
import { NetworkError } from 'src/app/shared/models/errors/provider/NetworkError';
import { OrderBookApiService } from 'src/app/core/services/backend/order-book-api/order-book-api.service';
import { ContractParameters } from 'src/app/core/services/order-book-common/models/ContractParameters';
import { OrderBookCommonService } from 'src/app/core/services/order-book-common/order-book-common.service';
import { ErrorsService } from 'src/app/core/services/errors/errors.service';
import InsufficientFundsError from 'src/app/shared/models/errors/instant-trade/InsufficientFundsError';
import { BIG_NUMBER_FORMAT } from 'src/app/shared/constants/formats/BIG_NUMBER_FORMAT';
import {
  ORDER_BOOK_TRADE_STATUS,
  OrderBookDataToken,
  OrderBookTradeData
} from '../models/trade-data';

@Injectable()
export class OrderBookTradeService {
  constructor(
    private web3PublicService: Web3PublicService,
    private web3PrivateService: Web3PrivateService,
    private orderBookApiService: OrderBookApiService,
    private orderBookCommonService: OrderBookCommonService,
    private readonly providerConnector: ProviderConnectorService,
    private readonly errorsService: ErrorsService
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

  public async setOwner(tradeData: OrderBookTradeData): Promise<OrderBookTradeData> {
    const web3Public: Web3Public = this.web3PublicService[tradeData.blockchain];
    const { contractAddress, contractAbi } = this.getContractParameters(tradeData);

    tradeData.owner = await web3Public.callContractMethod(contractAddress, contractAbi, 'owners', {
      methodArguments: [tradeData.memo]
    });

    return tradeData;
  }

  public async setStatus(tradeData: OrderBookTradeData): Promise<OrderBookTradeData> {
    const web3Public: Web3Public = this.web3PublicService[tradeData.blockchain];
    const { contractAddress, contractAbi } = this.getContractParameters(tradeData);

    const { expirationDate } = tradeData;
    if (expirationDate.isBefore(moment.utc())) {
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

    return tradeData;
  }

  public setAmountContributed(tradeData: OrderBookTradeData): Promise<OrderBookTradeData> {
    return this.orderBookCommonService.setAmountContributed(tradeData);
  }

  public async setInvestorsNumber(tradeData: OrderBookTradeData): Promise<OrderBookTradeData> {
    const web3Public: Web3Public = this.web3PublicService[tradeData.blockchain];
    const { contractAddress, contractAbi } = this.getContractParameters(tradeData);

    const fromInvestors: string[] = await web3Public.callContractMethod(
      contractAddress,
      contractAbi,
      'baseInvestors',
      {
        methodArguments: [tradeData.memo]
      }
    );
    tradeData.token.from.investorsNumber = fromInvestors.length;

    const toInvestors: string[] = await web3Public.callContractMethod(
      contractAddress,
      contractAbi,
      'quoteInvestors',
      {
        methodArguments: [tradeData.memo]
      }
    );
    tradeData.token.to.investorsNumber = toInvestors.length;

    return tradeData;
  }

  public async setAllowance(tradeData: OrderBookTradeData): Promise<OrderBookTradeData> {
    await this.setAllowanceToToken(tradeData, 'from');
    await this.setAllowanceToToken(tradeData, 'to');

    return tradeData;
  }

  public async setAllowanceToToken(
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
      this.providerConnector.address,
      contractAddress
    );
  }

  private checkSettings(tradeData: OrderBookTradeData): void {
    if (
      this.providerConnector.networkName !== tradeData.blockchain &&
      this.providerConnector.networkName !== `${tradeData.blockchain}_TESTNET`
    ) {
      this.errorsService.throw(new NetworkError(tradeData.blockchain));
    }
  }

  public async makeApprove(
    tradeData: OrderBookTradeData,
    tokenPart: TokenPart,
    onTransactionHash: (hash: string) => void
  ): Promise<TransactionReceipt> {
    this.checkSettings(tradeData);

    const { contractAddress } = this.getContractParameters(tradeData);

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

  private async checkBalance(token: OrderBookDataToken, amount: string): Promise<void> {
    const web3Public: Web3Public = this.web3PublicService[token.blockchain];
    let balance: BigNumber;
    if (web3Public.isNativeAddress(token.address)) {
      balance = await web3Public.getBalance(this.providerConnector.address, { inWei: true });
    } else {
      balance = await web3Public.getTokenBalance(this.providerConnector.address, token.address);
    }

    const amountInWei = Web3PublicService.tokenAmountToWei(token, amount);
    if (balance.lt(amountInWei)) {
      const formattedTokensBalance = Web3PublicService.tokenWeiToAmount(token, balance).toFormat(
        BIG_NUMBER_FORMAT
      );
      this.errorsService.throw(
        new InsufficientFundsError(token.symbol, formattedTokensBalance, amount)
      );
    }
  }

  public async checkApproveAndMakeContribute(
    tradeData: OrderBookTradeData,
    tokenPart: TokenPart,
    amount: string,
    onTransactionHash: (hash: string) => void
  ): Promise<TransactionReceipt> {
    this.checkSettings(tradeData);
    await this.checkBalance(tradeData.token[tokenPart], amount);

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
    const receipt = await this.web3PrivateService.executeContractMethod(
      contractAddress,
      contractAbi,
      'deposit',
      [tradeData.memo, tradeData.token[tokenPart].address, value],
      {
        onTransactionHash,
        value: web3Public.isNativeAddress(tradeData.token[tokenPart].address) ? value : undefined
      }
    );

    this.orderBookApiService.notifyOrderBooksBotOnContribute(
      tradeData.token[tokenPart],
      amount,
      tradeData.uniqueLink,
      receipt.from,
      receipt.transactionHash
    );

    return receipt;
  }

  public async makeWithdraw(
    tradeData: OrderBookTradeData,
    tokenPart: TokenPart,
    onTransactionHash: (hash: string) => void
  ): Promise<TransactionReceipt> {
    this.checkSettings(tradeData);

    const { contractAddress, contractAbi } = this.getContractParameters(tradeData);

    const receipt = await this.web3PrivateService.executeContractMethod(
      contractAddress,
      contractAbi,
      'refund',
      [tradeData.memo, tradeData.token[tokenPart].address],
      {
        onTransactionHash
      }
    );
    this.orderBookApiService.notifyOrderBooksBotOnWithdraw(
      tradeData.token[tokenPart],
      tradeData.uniqueLink,
      receipt.from,
      receipt.transactionHash
    );

    return receipt;
  }

  public async cancelTrade(
    tradeData: OrderBookTradeData,
    onTransactionHash: (hash: string) => void
  ): Promise<TransactionReceipt> {
    this.checkSettings(tradeData);

    const { contractAddress, contractAbi } = this.getContractParameters(tradeData);

    return this.web3PrivateService.executeContractMethod(
      contractAddress,
      contractAbi,
      'cancel',
      [tradeData.memo],
      {
        onTransactionHash
      }
    );
  }
}
