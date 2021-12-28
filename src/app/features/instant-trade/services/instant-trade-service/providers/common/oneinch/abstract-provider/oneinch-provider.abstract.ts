import InstantTradeToken from '@features/instant-trade/models/instant-trade-token';
import BigNumber from 'bignumber.js';
import InstantTrade from '@features/instant-trade/models/Instant-trade';
import { Observable } from 'rxjs';
import {
  ItOptions,
  ItProvider
} from '@features/instant-trade/services/instant-trade-service/models/it-provider';
import { TransactionReceipt } from 'web3-eth';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';
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

  public async approve(tokenAddress: string, options: TransactionOptions): Promise<void> {
    return this.commonOneinchService.approve(this.blockchain, tokenAddress, options);
  }

  public async calculateTrade(
    fromToken: InstantTradeToken,
    fromAmount: BigNumber,
    toToken: InstantTradeToken,
    shouldCalculateGas: boolean
  ): Promise<InstantTrade> {
    return this.commonOneinchService.calculateTrade(
      this.blockchain,
      fromToken,
      fromAmount,
      toToken,
      shouldCalculateGas
    );
  }

  public async createTrade(
    trade: InstantTrade,
    options: ItOptions = {}
  ): Promise<TransactionReceipt> {
    return this.commonOneinchService.createTrade(trade, options);
  }
}
