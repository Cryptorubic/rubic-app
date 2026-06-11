import { WALLET_NAME } from '@app/core/wallets-modal/components/wallets-modal/models/wallet-name';
import { ChainType } from '@cryptorubic/core';

export interface AddressChangedMsg {
  address: string;
  walletName: WALLET_NAME;
  chainType: ChainType;
}
