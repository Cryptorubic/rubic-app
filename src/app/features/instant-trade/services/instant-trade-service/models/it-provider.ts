import BigNumber from 'bignumber.js';
import InstantTradeToken from 'src/app/features/instant-trade/models/InstantTradeToken';
import { Observable } from 'rxjs';
import InstantTrade from 'src/app/features/instant-trade/models/InstantTrade';
import { TransactionReceipt } from 'web3-eth';

export interface ItProvider {
  createTrade: (
    trade: InstantTrade,
    options: { onConfirm?: (hash: string) => void; onApprove?: (hash: string | null) => void }
  ) => Promise<TransactionReceipt>;
  calculateTrade: (
    fromAmount: BigNumber,
    fromToken: InstantTradeToken,
    toToken: InstantTradeToken
  ) => Promise<InstantTrade>;
  getAllowance: (tokenAddress: string) => Observable<BigNumber>;
  approve: (
    tokenAddress: string,
    options: {
      onTransactionHash?: (hash: string) => void;
    }
  ) => Promise<void>;
}
