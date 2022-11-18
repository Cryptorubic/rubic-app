import { BlockchainName } from 'rubic-sdk';

export type NonOnChainNetworks = 'BITGERT' | 'ASTAR' | 'BITCOIN';

export type SupportedOnChainNetworks = Exclude<BlockchainName, NonOnChainNetworks>;
