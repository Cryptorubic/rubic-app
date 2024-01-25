import { BLOCKCHAIN_NAME, BlockchainName } from 'rubic-sdk';

export interface RankedBlockchain {
  name: BlockchainName;
  rank: number;
  tags: string[];
}

export const notEvmChangeNowBlockchainsList = {};

export const blockchainsList: RankedBlockchain[] = [
  { name: BLOCKCHAIN_NAME.GOERLI, rank: 1, tags: [] },
  { name: BLOCKCHAIN_NAME.SCROLL_SEPOLIA, rank: 1, tags: [] },
  { name: BLOCKCHAIN_NAME.ARTHERA, rank: 1, tags: [] },
  { name: BLOCKCHAIN_NAME.ZETACHAIN, rank: 1, tags: [] },
  { name: BLOCKCHAIN_NAME.TAIKO, rank: 1, tags: [] },
  { name: BLOCKCHAIN_NAME.SEPOLIA, rank: 1, tags: [] },
  { name: BLOCKCHAIN_NAME.BERACHAIN, rank: 1, tags: [] },
  { name: BLOCKCHAIN_NAME.BLAST, rank: 1, tags: [] }
  // { name: BLOCKCHAIN_NAME.FUJI, rank: 1, tags: [] },
  // { name: BLOCKCHAIN_NAME.MUMBAI, rank: 1, tags: [] },
  // { name: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN_TESTNET, rank: 1, tags: [] },
];
