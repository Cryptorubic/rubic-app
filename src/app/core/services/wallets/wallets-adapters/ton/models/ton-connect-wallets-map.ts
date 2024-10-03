import { WALLET_NAME } from '@app/core/wallets-modal/components/wallets-modal/models/wallet-name';

// all list can find on https://github.com/ton-blockchain/wallets-list/blob/main/wallets-v2.json
export type PopularTonConnectWallets = 'mytonwallet' | 'tonkeeper' | 'telegram-wallet';

export const TON_CONNECT_WALLETS_MAP: Record<PopularTonConnectWallets, WALLET_NAME> = {
  mytonwallet: WALLET_NAME.MY_TON_WALLET,
  'telegram-wallet': WALLET_NAME.TELEGRAM_WALLET,
  tonkeeper: WALLET_NAME.TONKEEPER
} as const;
