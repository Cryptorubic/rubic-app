import BigNumber from 'bignumber.js';
import InstantTradeToken from '@features/instant-trade/models/instant-trade-token';
import { Observable } from 'rxjs';
import InstantTrade from '@features/instant-trade/models/instant-trade';
import { TransactionReceipt } from 'web3-eth';
import { INSTANT_TRADES_PROVIDERS } from '@shared/models/instant-trade/instant-trade-providers';
import { TransactionOptions } from '@shared/models/blockchain/transaction-options';

export interface ItOptions {
  onConfirm?: (hash: string) => void;
  onApprove?: (hash: string | null) => void;
}

export interface ItProvider {
  readonly providerType: INSTANT_TRADES_PROVIDERS;

  get contractAddress(): string;

  getAllowance: (tokenAddress: string) => Observable<BigNumber>;

  approve: (
    tokenAddress: string,
    options: {
      onTransactionHash?: (hash: string) => void;
    }
  ) => Promise<void>;

  calculateTrade: (
    fromToken: InstantTradeToken,
    fromAmount: BigNumber,
    toToken: InstantTradeToken,
    shouldCalculateGas: boolean,
    fromAddress?: string
  ) => Promise<InstantTrade>;

  createTrade: (trade: InstantTrade, options: ItOptions) => Promise<Partial<TransactionReceipt>>;

  checkAndEncodeTrade?: (
    trade: InstantTrade,
    targetWalletAddress: string,
    options: ItOptions
  ) => Promise<{
    encodedData: string;
    transactionOptions?: TransactionOptions;
  }>;
}
