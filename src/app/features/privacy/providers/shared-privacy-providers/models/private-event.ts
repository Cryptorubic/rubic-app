import { BlockchainName, TokenAmount } from '@cryptorubic/core';

export interface PrivateEvent<T extends BlockchainName = BlockchainName> {
  token: TokenAmount<T>;
  loadingCallback: () => void;
}
