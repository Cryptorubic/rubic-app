import InstantTradeToken from '@features/instant-trade/models/instant-trade-token';
import BigNumber from 'bignumber.js';
import InstantTrade from '@features/instant-trade/models/instant-trade';
import { Observable } from 'rxjs';
import {
  ItOptions,
  ItProvider
} from '@features/instant-trade/services/instant-trade-service/models/it-provider';
import { TransactionReceipt } from 'web3-eth';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';
import { CommonOneinchService } from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/oneinch/common-oneinch/common-oneinch.service';
import { TransactionOptions } from 'src/app/shared/models/blockchain/transaction-options';
import { INSTANT_TRADES_PROVIDERS } from '@shared/models/instant-trade/instant-trade-providers';
import { RequiredField } from '@shared/models/utility-types/required-field';

export abstract class OneinchProviderAbstract implements ItProvider {
  public abstract readonly providerType: INSTANT_TRADES_PROVIDERS;

  private readonly blockchain: BLOCKCHAIN_NAME;

  public readonly contractAddress = '0x1111111254fb6c44bac0bed2854e76f90643097d';

  constructor(
    blockchain: BLOCKCHAIN_NAME,
    private readonly commonOneinchService: CommonOneinchService
  ) {
    this.blockchain = blockchain;
  }

  public getAllowance(tokenAddress: string): Observable<BigNumber> {
    return this.commonOneinchService.getAllowance(this.blockchain, tokenAddress);
  }

  public approve(tokenAddress: string, options: TransactionOptions): Promise<void> {
    return this.commonOneinchService.approve(this.blockchain, tokenAddress, options);
  }

  public calculateTrade(
    fromToken: InstantTradeToken,
    fromAmount: BigNumber,
    toToken: InstantTradeToken,
    shouldCalculateGas: boolean,
    fromAddress?: string
  ): Promise<InstantTrade> {
    return this.commonOneinchService.calculateTrade(
      this.blockchain,
      fromToken,
      fromAmount,
      toToken,
      shouldCalculateGas,
      fromAddress
    );
  }

  public createTrade(trade: InstantTrade, options: ItOptions = {}): Promise<TransactionReceipt> {
    return this.commonOneinchService.createTrade(trade, options);
  }

  public checkAndEncodeTrade(
    trade: InstantTrade,
    targetWalletAddress: string,
    options: ItOptions = {}
  ): Promise<RequiredField<TransactionOptions, 'data'>> {
    return this.commonOneinchService.checkAndEncodeTrade(trade, targetWalletAddress, options);
  }
}
