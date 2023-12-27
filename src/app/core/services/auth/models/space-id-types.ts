import { BLOCKCHAIN_NAME } from 'rubic-sdk';

export const spaceIdDomains = {
  [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: 'bnb',
  [BLOCKCHAIN_NAME.ARBITRUM]: 'arb1',
  [BLOCKCHAIN_NAME.ETHEREUM]: 'eth'
} as const;

export type SpaceIdSupportedBlockchain = keyof typeof spaceIdDomains;

export interface SpaceIdData {
  name: string;
  avatar: string | null;
}
