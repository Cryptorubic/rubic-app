import { WALLET_NAME } from '@app/core/wallets-modal/components/wallets-modal/models/wallet-name';
import { ChainType } from '@cryptorubic/core';

export interface LastEventInWalletsManager {
  affectedWalletAddress: string;
  affectedWalletName: WALLET_NAME;
  affectedChainType: ChainType;
  type: 'connected' | 'disconnected';
}
