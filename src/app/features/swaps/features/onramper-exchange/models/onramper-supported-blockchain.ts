import { BLOCKCHAIN_NAME } from 'rubic-sdk';

export const onramperSupportedBlockchains = [
  BLOCKCHAIN_NAME.ETHEREUM,
  BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
  BLOCKCHAIN_NAME.POLYGON,
  BLOCKCHAIN_NAME.AVALANCHE
] as const;

export type OnramperSupportedBlockchain = typeof onramperSupportedBlockchains[number];
