import { CHAIN_TYPE, ChainType } from '@cryptorubic/core';

export const USER_WALLETS_CHAIN_TYPES: Array<{ img: string; label: string; value: ChainType }> = [
  { img: 'assets/images/wallets/chain-types/evm.png', label: 'Bitcoin', value: CHAIN_TYPE.BITCOIN },
  { img: 'assets/images/wallets/chain-types/evm.png', label: 'EVM', value: CHAIN_TYPE.EVM },
  {
    img: 'assets/images/wallets/chain-types/solana.png',
    label: 'Solana',
    value: CHAIN_TYPE.SOLANA
  },
  { img: 'assets/images/wallets/chain-types/tron.png', label: 'Tron', value: CHAIN_TYPE.TRON },
  { img: 'assets/images/wallets/chain-types/ton.png', label: 'Ton', value: CHAIN_TYPE.TON },
  { img: 'assets/images/wallets/chain-types/sui.png', label: 'Sui', value: CHAIN_TYPE.SUI },
  {
    img: 'assets/images/wallets/chain-types/stellar.png',
    label: 'Stellar',
    value: CHAIN_TYPE.STELLAR
  }
];
