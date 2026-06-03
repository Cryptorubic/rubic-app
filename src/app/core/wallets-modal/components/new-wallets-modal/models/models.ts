import { CommonWalletAdapter } from '@app/core/services/wallets/wallets-adapters/common-wallet-adapter';
import { WALLET_NAME } from '../../wallets-modal/models/wallet-name';

export interface WalletFilterConfig {
  /**
   * returns a callback used to filter wallets in WalletsListComponent
   */
  filterFunc: WalletFilterFunc;
  /**
   * returns a callback showing if any wallet with the same chain already connected
   */
  connectedFunc: AlreadyConnectedFunc;
  img: string;
  label: string;
}

export type WalletFilterFunc = (walletName: WALLET_NAME) => boolean;
export type AlreadyConnectedFunc = (activeWallets: CommonWalletAdapter[]) => boolean;

export interface WalletConfigUI {
  name: string;
  value: WALLET_NAME;
  img: string;
  supportsDesktop: boolean;
  supportsMobile: boolean;
  display: boolean;
  disabled: boolean;
}
