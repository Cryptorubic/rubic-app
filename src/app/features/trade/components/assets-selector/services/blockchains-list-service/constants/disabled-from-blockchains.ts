import { BLOCKCHAIN_NAME, BlockchainName } from '@cryptorubic/core';

export const disabledFromBlockchains: BlockchainName[] = [
  BLOCKCHAIN_NAME.FLOW,
  BLOCKCHAIN_NAME.IOTA,
  BLOCKCHAIN_NAME.KADENA,
  BLOCKCHAIN_NAME.KUSAMA,
  BLOCKCHAIN_NAME.MINA_PROTOCOL,
  BLOCKCHAIN_NAME.SIA,
  BLOCKCHAIN_NAME.SECRET,
  BLOCKCHAIN_NAME.WAX,
  BLOCKCHAIN_NAME.GRAVITY,
  BLOCKCHAIN_NAME.SEI,
  BLOCKCHAIN_NAME.CELO,
  BLOCKCHAIN_NAME.AURORA
];

export const DISABLED_BLOCKCHAINS_MAP = disabledFromBlockchains.reduce(
  (acc, chain) => ({ ...acc, [chain]: true }),
  {} as Partial<Record<BlockchainName, boolean>>
);
