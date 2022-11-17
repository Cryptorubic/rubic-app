import { BlockchainName } from 'rubic-sdk';

export type NonOnChainNetworks = 'METIS' | 'BITGERT' | 'ASTAR' | 'BITCOIN';

export type SupportedOnChainNetworks = Exclude<BlockchainName, NonOnChainNetworks>;
