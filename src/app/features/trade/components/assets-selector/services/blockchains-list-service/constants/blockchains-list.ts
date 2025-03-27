import { BLOCKCHAIN_NAME, BlockchainName } from 'rubic-sdk';

export interface RankedBlockchain {
  name: BlockchainName;
  rank: number;
  tags: string[];
}

export const notEvmChangeNowBlockchainsList = {};

export const defaultBlockchainsList: BlockchainName[] = [
  BLOCKCHAIN_NAME.SONEIUM_TESTNET,
  BLOCKCHAIN_NAME.UNICHAIN_SEPOLIA_TESTNET,
  BLOCKCHAIN_NAME.MONAD_TESTNET,
  BLOCKCHAIN_NAME.MEGAETH_TESTNET,
  BLOCKCHAIN_NAME.BERACHAIN_TESTNET,
  BLOCKCHAIN_NAME.SEPOLIA,
  BLOCKCHAIN_NAME.SCROLL_SEPOLIA,
  BLOCKCHAIN_NAME.ARTHERA,
  BLOCKCHAIN_NAME.HOLESKY,
  BLOCKCHAIN_NAME.BLAST_TESTNET,
  BLOCKCHAIN_NAME.TAIKO
];

export const blockchainsList: RankedBlockchain[] = defaultBlockchainsList.map(chain => {
  return {
    name: chain,
    rank: 1,
    tags: []
  };
});
