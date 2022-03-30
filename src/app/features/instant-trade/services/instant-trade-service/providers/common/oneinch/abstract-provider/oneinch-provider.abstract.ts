import InstantTradeToken from '@features/instant-trade/models/instant-trade-token';
import BigNumber from 'bignumber.js';
import { Observable } from 'rxjs';
import {
  ItOptions,
  ItProvider
} from '@features/instant-trade/services/instant-trade-service/models/it-provider';
import { TransactionReceipt } from 'web3-eth';
import { EthLikeBlockchainName } from '@shared/models/blockchain/blockchain-name';
import { CommonOneinchService } from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/oneinch/common-oneinch/common-oneinch.service';
import { TransactionOptions } from 'src/app/shared/models/blockchain/transaction-options';
import { INSTANT_TRADE_PROVIDER } from '@shared/models/instant-trade/instant-trade-provider';
import { RequiredField } from '@shared/models/utility-types/required-field';
import { OneinchInstantTrade } from '@features/instant-trade/services/instant-trade-service/providers/common/oneinch/common-oneinch/models/oneinch-instant-trade';

export abstract class OneinchProviderAbstract implements ItProvider {
  public abstract readonly providerType: INSTANT_TRADE_PROVIDER;

  private readonly blockchain: EthLikeBlockchainName;

  public readonly contractAddress = this.commonOneinchService.contractAddress;

  protected constructor(
    blockchain: EthLikeBlockchainName,
    private readonly commonOneinchService: CommonOneinchService
  ) {
    this.blockchain = blockchain;
  }

  public getAllowance(tokenAddress: string, targetContractAddress: string): Observable<BigNumber> {
    return this.commonOneinchService.getAllowance(
      this.blockchain,
      tokenAddress,
      targetContractAddress
    );
  }

  public approve(
    tokenAddress: string,
    options: TransactionOptions,
    targetContractAddress: string
  ): Promise<void> {
    return this.commonOneinchService.approve(
      this.blockchain,
      tokenAddress,
      options,
      targetContractAddress
    );
  }

  public calculateTrade(
    fromToken: InstantTradeToken,
    fromAmount: BigNumber,
    toToken: InstantTradeToken,
    shouldCalculateGas: boolean,
    fromAddress?: string
  ): Promise<OneinchInstantTrade> {
    return this.commonOneinchService.calculateTrade(
      this.blockchain,
      fromToken,
      fromAmount,
      toToken,
      shouldCalculateGas,
      fromAddress
    );
  }

  public createTrade(
    trade: OneinchInstantTrade,
    options: ItOptions = {}
  ): Promise<TransactionReceipt> {
    return this.commonOneinchService.createTrade(trade, options);
  }

  public checkAndEncodeTrade(
    trade: OneinchInstantTrade,
    options: ItOptions,
    receiverAddress: string
  ): Promise<RequiredField<TransactionOptions, 'data'>> {
    return this.commonOneinchService.checkAndEncodeTrade(trade, options, receiverAddress);
  }
}
