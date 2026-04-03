import { BLOCKCHAIN_NAME, BlockchainName } from '@cryptorubic/core';

export const ZKP2P_SUPPORTED_CHAINS = [
  BLOCKCHAIN_NAME.BASE,
  BLOCKCHAIN_NAME.ETHEREUM,
  BLOCKCHAIN_NAME.OPTIMISM,
  BLOCKCHAIN_NAME.ARBITRUM,
  BLOCKCHAIN_NAME.POLYGON,
  BLOCKCHAIN_NAME.ZK_SYNC,
  BLOCKCHAIN_NAME.LINEA,
  BLOCKCHAIN_NAME.SCROLL,
  BLOCKCHAIN_NAME.HYPER_EVM,
  BLOCKCHAIN_NAME.SOLANA
] as const;

export type Zkp2pSupportedChain = (typeof ZKP2P_SUPPORTED_CHAINS)[number];

export function isZkp2pSupportedChain(
  blockchain: BlockchainName
): blockchain is Zkp2pSupportedChain {
  return (ZKP2P_SUPPORTED_CHAINS as Readonly<BlockchainName[]>).includes(blockchain);
}
