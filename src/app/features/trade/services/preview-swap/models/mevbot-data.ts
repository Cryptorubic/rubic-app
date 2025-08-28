import { BLOCKCHAIN_NAME } from '@cryptorubic/sdk';

export const mevBotSupportedBlockchains = [
  BLOCKCHAIN_NAME.ETHEREUM,
  BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
  BLOCKCHAIN_NAME.POLYGON
] as const;

export type MevBotSupportedBlockchain = (typeof mevBotSupportedBlockchains)[number];

export const mevBotRpcAddresses: Record<MevBotSupportedBlockchain, string> = {
  [BLOCKCHAIN_NAME.ETHEREUM]: 'https://rubic-eth.rpc.blxrbdn.com',
  [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: 'https://rubic-bnb.rpc.blxrbdn.com',
  [BLOCKCHAIN_NAME.POLYGON]: 'https://rubic-polygon.rpc.blxrbdn.com'
};
