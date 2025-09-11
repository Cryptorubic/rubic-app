import { BLOCKCHAIN_NAME } from '@cryptorubic/sdk';

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

export interface SpaceIdGetMetadataResponse {
  attributes: MetadataAttribute[];
  description: string;
  image: string;
  name: string;
}

interface MetadataAttribute {
  display_type: string;
  trait_type: string;
  value: number;
}
