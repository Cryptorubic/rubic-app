import { WALLET_NAME } from '@core/wallets-modal/components/wallets-modal/models/wallet-name';

export interface WalletProvider {
  name: string;
  value: WALLET_NAME;
  img: string;
  supportsDesktop: boolean;
  supportsMobile: boolean;
  display: boolean;
  disabled: boolean;
  supportBerachella: boolean;
}
