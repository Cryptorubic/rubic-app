import { BLOCKCHAIN_NAME, BlockchainName } from 'rubic-sdk';

export interface RankedBlockchain {
  name: BlockchainName;
  rank: number;
  tags: string[];
}

export const notEvmChangeNowBlockchainsList = {};

export const defaultBlockchainsList: BlockchainName[] = [
  BLOCKCHAIN_NAME.SEPOLIA,
  BLOCKCHAIN_NAME.BERACHAIN,
  BLOCKCHAIN_NAME.BLAST,
  BLOCKCHAIN_NAME.TAIKO,
  BLOCKCHAIN_NAME.SCROLL_SEPOLIA,
  BLOCKCHAIN_NAME.ARTHERA,
  BLOCKCHAIN_NAME.GOERLI
];

export const blockchainsList: RankedBlockchain[] = defaultBlockchainsList.map(chain => {
  return {
    name: chain,
    rank: 1,
    tags: []
  };
});
