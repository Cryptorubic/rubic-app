import {
  BlockchainName,
  ETH_LIKE_BLOCKCHAIN_NAME,
  EthLikeBlockchainName
} from '@shared/models/blockchain/blockchain-name';

export function isEthLikeBlockchainName(
  blockchain: BlockchainName
): blockchain is EthLikeBlockchainName {
  return Object.values(ETH_LIKE_BLOCKCHAIN_NAME).some(
    ethLikeBlockchain => ethLikeBlockchain === blockchain
  );
}
