import { BLOCKCHAIN_NAME, BlockchainName } from 'rubic-sdk';

export const CHAINS_TO_LOAD_FIRSTLY = [
  BLOCKCHAIN_NAME.ETHEREUM,
  BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
  BLOCKCHAIN_NAME.ARBITRUM,
  BLOCKCHAIN_NAME.POLYGON,
  BLOCKCHAIN_NAME.BASE,
  BLOCKCHAIN_NAME.ZK_SYNC
] as const;

export type ChainsToLoadFirstly = (typeof CHAINS_TO_LOAD_FIRSTLY)[number];

export function isTopChain(blockchain: BlockchainName): blockchain is ChainsToLoadFirstly {
  return CHAINS_TO_LOAD_FIRSTLY.some(topChain => topChain === blockchain);
}
