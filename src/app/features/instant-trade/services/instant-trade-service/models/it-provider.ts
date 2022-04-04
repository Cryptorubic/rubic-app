import BigNumber from 'bignumber.js';
import InstantTradeToken from '@features/instant-trade/models/instant-trade-token';
import InstantTrade from '@features/instant-trade/models/instant-trade';
import { TransactionReceipt } from 'web3-eth';
import { INSTANT_TRADE_PROVIDER } from '@shared/models/instant-trade/instant-trade-provider';
import { TransactionOptions } from '@shared/models/blockchain/transaction-options';
import { RequiredField } from '@shared/models/utility-types/required-field';

export interface ItOptions {
  onConfirm?: (hash: string) => void;
  onApprove?: (hash: string | null) => void;
}

export interface ItProvider {
  readonly providerType: INSTANT_TRADE_PROVIDER;

  readonly contractAddress: string;

  getAllowance(tokenAddress: string, targetContractAddress?: string): Promise<BigNumber>;

  approve(
    tokenAddress: string,
    options: TransactionOptions,
    targetContractAddress?: string
  ): Promise<void>;

  calculateTrade(
    fromToken: InstantTradeToken,
    fromAmount: BigNumber,
    toToken: InstantTradeToken,
    shouldCalculateGas: boolean,
    fromAddress?: string
  ): Promise<InstantTrade>;

  createTrade(trade: InstantTrade, options: ItOptions): Promise<Partial<TransactionReceipt>>;

  checkAndEncodeTrade?(
    trade: InstantTrade,
    options: ItOptions,
    receiverAddress: string
  ): Promise<RequiredField<TransactionOptions, 'data'>>;
}
