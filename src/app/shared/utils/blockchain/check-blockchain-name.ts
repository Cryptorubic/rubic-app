import {
  BLOCKCHAIN_NAMES,
  BlockchainName,
  ETH_LIKE_BLOCKCHAIN_NAMES,
  EthLikeBlockchainName
} from '@shared/models/blockchain/blockchain-name';

export function isBlockchainName(chain: string): chain is BlockchainName {
  return BLOCKCHAIN_NAMES.some(blockchainName => blockchainName === chain);
}

export function isEthLikeBlockchainName(
  blockchain: BlockchainName
): blockchain is EthLikeBlockchainName {
  return ETH_LIKE_BLOCKCHAIN_NAMES.some(ethLikeBlockchain => ethLikeBlockchain === blockchain);
}
