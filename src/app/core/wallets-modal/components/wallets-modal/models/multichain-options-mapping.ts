import { CHAIN_TYPE, ChainType } from '@cryptorubic/core';
import { MultichainWalletOption } from './types';
import { blockchainIcon } from '@app/shared/constants/blockchain/blockchain-icon';
import { WALLET_NAME } from './wallet-name';

const availableMultichainOptions: Partial<
  Record<ChainType, Omit<MultichainWalletOption, 'value'>>
> = {
  [CHAIN_TYPE.EVM]: { label: 'EVM', icon: blockchainIcon.ETH },
  [CHAIN_TYPE.SOLANA]: { label: 'Solana', icon: blockchainIcon.SOLANA },
  [CHAIN_TYPE.BITCOIN]: { label: 'Bitcoin', icon: blockchainIcon.BITCOIN }
};

export const MULTICHAIN_OPTIONS_MAPPING: Partial<Record<WALLET_NAME, MultichainWalletOption[]>> = {
  [WALLET_NAME.METAMASK]: [
    { ...availableMultichainOptions[CHAIN_TYPE.EVM]!, value: WALLET_NAME.METAMASK },
    { ...availableMultichainOptions[CHAIN_TYPE.SOLANA]!, value: WALLET_NAME.METAMASK_SOLANA }
  ],
  [WALLET_NAME.PHANTOM]: [
    { ...availableMultichainOptions[CHAIN_TYPE.SOLANA]!, value: WALLET_NAME.PHANTOM },
    { ...availableMultichainOptions[CHAIN_TYPE.BITCOIN]!, value: WALLET_NAME.PHANTOM_BITCOIN }
  ]
};

// PROVIDERS_LIST.filter(el => el.name === 'MetaMask').map(el => {
//     const chainType = el.value === WALLET_NAME.METAMASK ? CHAIN_TYPE.EVM : CHAIN_TYPE.SOLANA;
//     const walletMapping: Record<
//       typeof chainType,
//       { label: string; icon: string; value: WALLET_NAME }
//     > = {
//       [CHAIN_TYPE.EVM]: { label: 'EVM', icon: blockchainIcon.ETH, value: WALLET_NAME.METAMASK },
//       [CHAIN_TYPE.SOLANA]: {
//         label: 'Solana',
//         icon: blockchainIcon.SOLANA,
//         value: WALLET_NAME.METAMASK_SOLANA
//       }
//     };
//     return walletMapping[chainType];
//   });
