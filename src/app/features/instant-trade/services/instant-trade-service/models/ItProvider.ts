import BigNumber from 'bignumber.js';
import InstantTradeToken from 'src/app/features/instant-trade/models/InstantTradeToken';
import { Observable } from 'rxjs';
import InstantTrade from 'src/app/features/instant-trade/models/InstantTrade';
import { TransactionReceipt } from 'web3-eth';
import { INSTANT_TRADES_PROVIDER } from '@shared/models/instant-trade/INSTANT_TRADES_PROVIDER';

export interface ItOptions {
  onConfirm?: (hash: string) => void;
  onApprove?: (hash: string | null) => void;
}

export interface ItProvider {
  readonly providerType: INSTANT_TRADES_PROVIDER;

  createTrade: (trade: InstantTrade, options: ItOptions) => Promise<Partial<TransactionReceipt>>;

  calculateTrade: (
    fromToken: InstantTradeToken,
    fromAmount: BigNumber,
    toToken: InstantTradeToken,
    shouldCalculateGas: boolean
  ) => Promise<InstantTrade>;

  getAllowance: (tokenAddress: string) => Observable<BigNumber>;

  approve: (
    tokenAddress: string,
    options: {
      onTransactionHash?: (hash: string) => void;
    }
  ) => Promise<void>;
}
