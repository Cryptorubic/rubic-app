import InstantTradeToken from 'src/app/features/instant-trade/models/InstantTradeToken';
import BigNumber from 'bignumber.js';
import InstantTrade from 'src/app/features/instant-trade/models/InstantTrade';
import { Observable } from 'rxjs';
import {
  ItOptions,
  ItProvider
} from 'src/app/features/instant-trade/services/instant-trade-service/models/ItProvider';
import { TransactionReceipt } from 'web3-eth';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { CommonOneinchService } from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/oneinch/common-oneinch/common-oneinch.service';
import { TransactionOptions } from 'src/app/shared/models/blockchain/transaction-options';

export abstract class OneinchProviderAbstract implements ItProvider {
  private readonly blockchain: BLOCKCHAIN_NAME;

  constructor(
    blockchain: BLOCKCHAIN_NAME,
    private readonly commonOneinchService: CommonOneinchService
  ) {
    this.blockchain = blockchain;
  }

  public getAllowance(tokenAddress: string): Observable<BigNumber> {
    return this.commonOneinchService.getAllowance(this.blockchain, tokenAddress);
  }

  public async approve(
    tokenAddress: string,
    options: TransactionOptions,
    minGasPrice?: BigNumber
  ): Promise<void> {
    return this.commonOneinchService.approve(this.blockchain, tokenAddress, options, minGasPrice);
  }

  public async calculateTrade(
    fromToken: InstantTradeToken,
    fromAmount: BigNumber,
    toToken: InstantTradeToken,
    shouldCalculateGas: boolean,
    minGasPrice?: BigNumber
  ): Promise<InstantTrade> {
    return this.commonOneinchService.calculateTrade(
      this.blockchain,
      fromToken,
      fromAmount,
      toToken,
      shouldCalculateGas,
      minGasPrice
    );
  }

  public async createTrade(
    trade: InstantTrade,
    options: ItOptions = {}
  ): Promise<TransactionReceipt> {
    return this.commonOneinchService.createTrade(trade, options);
  }
}
