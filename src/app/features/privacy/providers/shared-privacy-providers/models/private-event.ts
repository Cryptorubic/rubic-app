import { BlockchainName, TokenAmount } from '@cryptorubic/core';
import { PrivateSwapInfo } from './swap-info';

export interface PrivateEvent<T extends BlockchainName = BlockchainName> {
  token: TokenAmount<T>;
  loadingCallback: () => void;
}

export interface PrivateSwapEvent {
  swapInfo: PrivateSwapInfo;
  loadingCallback: () => void;
}
