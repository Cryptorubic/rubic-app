import { BlockchainName } from 'rubic-sdk';

export type NonOnChainNetworks = 'OASIS' | 'METIS' | 'BITGERT' | 'ASTAR' | 'BITCOIN';

export type SupportedOnChainNetworks = Exclude<BlockchainName, NonOnChainNetworks>;
