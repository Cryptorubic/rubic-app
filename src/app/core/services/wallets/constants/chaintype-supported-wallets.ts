import { WALLET_NAME } from '@app/core/wallets-modal/components/wallets-modal/models/wallet-name';
import { CHAIN_TYPE, ChainType } from '@cryptorubic/core';

// @TODO_3003 get list of supported wallets for every chain type from QA
export const CHAIN_SUPPORTED_WALLETS = Object.values(CHAIN_TYPE).reduce(
  (acc, chainType: ChainType) => {
    switch (chainType) {
      case CHAIN_TYPE.EVM:
        acc[CHAIN_TYPE.EVM] = [
          WALLET_NAME.METAMASK,
          WALLET_NAME.COIN_BASE,
          WALLET_NAME.PHANTOM,
          WALLET_NAME.WALLET_CONNECT,
          WALLET_NAME.TRUST_WALLET,
          WALLET_NAME.BINANCE_WALLET
        ];
        break;
      case CHAIN_TYPE.TON:
        acc[CHAIN_TYPE.TON] = [WALLET_NAME.TON_CONNECT];
        break;
      case CHAIN_TYPE.TRON:
        acc[CHAIN_TYPE.TRON] = [WALLET_NAME.TRON_LINK];
        break;
      case CHAIN_TYPE.SOLANA:
        acc[CHAIN_TYPE.SOLANA] = [
          WALLET_NAME.SOLFLARE,
          WALLET_NAME.PHANTOM,
          WALLET_NAME.PHANTOM_SOLANA,
          WALLET_NAME.METAMASK_SOLANA
        ];
        break;
      case CHAIN_TYPE.SUI:
        acc[CHAIN_TYPE.SUI] = [WALLET_NAME.SUIET_WALLET, WALLET_NAME.SUI_WALLET];
        break;
      case CHAIN_TYPE.BITCOIN:
        acc[CHAIN_TYPE.SUI] = [WALLET_NAME.BACKPACK];
        break;
      default:
        acc[chainType] = [WALLET_NAME.WALLET_CONNECT];
    }
    return acc;
  },
  {} as Record<ChainType, WALLET_NAME[]>
);
