import { BLOCKCHAIN_NAME, BlockchainName } from 'rubic-sdk';

export interface RankedBlockchain {
  name: BlockchainName;
  rank: number;
  tags: string[];
}

export const notEvmChangeNowBlockchainsList = {};

export const blockchainsList: RankedBlockchain[] = [
  { name: BLOCKCHAIN_NAME.SCROLL_TESTNET, rank: 1, tags: [] },
  { name: BLOCKCHAIN_NAME.GOERLI, rank: 1, tags: [] }
  // { name: BLOCKCHAIN_NAME.FUJI, rank: 1, tags: [] },
  // { name: BLOCKCHAIN_NAME.MUMBAI, rank: 1, tags: [] },
  // { name: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN_TESTNET, rank: 1, tags: [] },
];

export const topRankedBlockchains = blockchainsList.map(blockchain => {
  if (blockchain.rank === 1) {
    return blockchain.name;
  }
});

export type NotEvmChangeNowBlockchainsList =
  (typeof notEvmChangeNowBlockchainsList)[keyof typeof notEvmChangeNowBlockchainsList];
