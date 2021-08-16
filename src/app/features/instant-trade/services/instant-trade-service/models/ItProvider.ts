import BigNumber from 'bignumber.js';
import InstantTradeToken from 'src/app/features/instant-trade/models/InstantTradeToken';
import { Observable } from 'rxjs';
import InstantTrade from 'src/app/features/instant-trade/models/InstantTrade';
import { TransactionReceipt } from 'web3-eth';

export interface ItOptions {
  onConfirm?: (hash: string) => void;
  onApprove?: (hash: string | null) => void;
}

export interface ItProvider {
  createTrade: (trade: InstantTrade, options: ItOptions) => Promise<TransactionReceipt>;
  calculateTrade: (
    fromToken: InstantTradeToken,
    fromAmount: BigNumber,
    toToken: InstantTradeToken,
    shouldCalculateGas: boolean,
    minGasPrice?: BigNumber
  ) => Promise<InstantTrade>;
  getAllowance: (tokenAddress: string) => Observable<BigNumber>;
  approve: (
    tokenAddress: string,
    options: {
      onTransactionHash?: (hash: string) => void;
    }
  ) => Promise<void>;
}
