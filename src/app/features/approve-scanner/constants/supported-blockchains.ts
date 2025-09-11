import { BLOCKCHAIN_NAME } from '@cryptorubic/sdk';

export const supportedBlockchains = [
  BLOCKCHAIN_NAME.ETHEREUM,
  BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
  BLOCKCHAIN_NAME.POLYGON,
  BLOCKCHAIN_NAME.ARBITRUM,
  BLOCKCHAIN_NAME.OPTIMISM,
  BLOCKCHAIN_NAME.AVALANCHE,
  BLOCKCHAIN_NAME.FANTOM
] as const;

export type SupportedBlockchain = (typeof supportedBlockchains)[number];
