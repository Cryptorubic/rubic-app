import { WALLET_NAME } from '@app/core/wallets-modal/components/wallets-modal/models/wallet-name';
import { CHAIN_TYPE, ChainType } from '@cryptorubic/core';

export interface WalletAdapterStaticConfig {
  chainTypes: Readonly<ChainType[]>;
}

export const WALLET_ADAPTER_STATIC_CONFIGS: Record<WALLET_NAME, WalletAdapterStaticConfig> = {
  [WALLET_NAME.ARGENT]: { chainTypes: [CHAIN_TYPE.EVM] },
  [WALLET_NAME.BACKPACK]: { chainTypes: [CHAIN_TYPE.SOLANA] },
  [WALLET_NAME.BEST_WALLET]: { chainTypes: [CHAIN_TYPE.EVM] },
  [WALLET_NAME.BINANCE_WALLET]: { chainTypes: [CHAIN_TYPE.EVM] },
  [WALLET_NAME.BITGET]: { chainTypes: [CHAIN_TYPE.EVM] },
  [WALLET_NAME.COIN_BASE]: { chainTypes: [CHAIN_TYPE.EVM] },
  [WALLET_NAME.CTRL]: { chainTypes: [CHAIN_TYPE.BITCOIN] },
  [WALLET_NAME.FREIGHTER]: { chainTypes: [CHAIN_TYPE.STELLAR] },
  [WALLET_NAME.HOLD_STATION]: { chainTypes: [CHAIN_TYPE.EVM] },
  [WALLET_NAME.LOBSTR]: { chainTypes: [CHAIN_TYPE.STELLAR] },
  [WALLET_NAME.METAMASK]: { chainTypes: [CHAIN_TYPE.EVM] },
  [WALLET_NAME.METAMASK_SOLANA]: { chainTypes: [CHAIN_TYPE.SOLANA] },
  [WALLET_NAME.MY_TON_WALLET]: { chainTypes: [CHAIN_TYPE.TON] },
  [WALLET_NAME.PHANTOM]: { chainTypes: [CHAIN_TYPE.SOLANA] },
  [WALLET_NAME.SAFE]: { chainTypes: [CHAIN_TYPE.EVM] },
  [WALLET_NAME.SLUSH]: { chainTypes: [CHAIN_TYPE.SUI] },
  [WALLET_NAME.SOLFLARE]: { chainTypes: [CHAIN_TYPE.SOLANA] },
  [WALLET_NAME.STELLAR_WALLET_CONNECT]: { chainTypes: [CHAIN_TYPE.STELLAR] },
  [WALLET_NAME.SUI_WALLET]: { chainTypes: [CHAIN_TYPE.SUI] },
  [WALLET_NAME.SUIET_WALLET]: { chainTypes: [CHAIN_TYPE.SUI] },
  [WALLET_NAME.TELEGRAM_WALLET]: { chainTypes: [CHAIN_TYPE.TON] },
  [WALLET_NAME.TOKEN_POCKET]: { chainTypes: [CHAIN_TYPE.EVM] },
  [WALLET_NAME.TONKEEPER]: { chainTypes: [CHAIN_TYPE.TON] },
  [WALLET_NAME.TON_CONNECT]: { chainTypes: [CHAIN_TYPE.TON] },
  [WALLET_NAME.TRON_LINK]: { chainTypes: [CHAIN_TYPE.TRON] },
  [WALLET_NAME.TRUST_WALLET]: { chainTypes: [CHAIN_TYPE.EVM] },
  [WALLET_NAME.WALLET_CONNECT]: { chainTypes: [CHAIN_TYPE.EVM] }
} as const;
