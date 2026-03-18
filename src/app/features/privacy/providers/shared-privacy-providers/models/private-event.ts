import { BlockchainName, TokenAmount } from '@cryptorubic/core';
import { PrivateSwapInfo } from './swap-info';
import { PreviewSwapModalFactory } from '../components/private-preview-swap/models/preview-swap-modal-factory';
import { BalanceToken } from '@shared/models/tokens/balance-token';

export interface PrivateEvent<T extends BlockchainName = BlockchainName> {
  token: TokenAmount<T>;
  balanceToken?: BalanceToken;
  loadingCallback: () => void;
  openPreview: PreviewSwapModalFactory;
}

export interface PrivateSwapEvent {
  swapInfo: PrivateSwapInfo;
  loadingCallback: () => void;
  openPreview: PreviewSwapModalFactory;
}
