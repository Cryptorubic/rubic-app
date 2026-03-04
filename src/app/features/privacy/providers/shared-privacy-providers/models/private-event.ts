import { BlockchainName, TokenAmount } from '@cryptorubic/core';
import { PreviewSwapModalFactory } from '../components/private-preview-swap/models/preview-swap-modal-factory';

export interface PrivateEvent<T extends BlockchainName = BlockchainName> {
  token: TokenAmount<T>;
  loadingCallback: () => void;
  openPreview: PreviewSwapModalFactory;
}
