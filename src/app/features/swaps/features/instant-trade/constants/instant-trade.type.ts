import { BlockchainName } from 'rubic-sdk';

export type NonOnChainNetworks = 'BITGERT' | 'ASTAR' | 'BITCOIN' | 'VELAS';

export type SupportedOnChainNetworks = Exclude<BlockchainName, NonOnChainNetworks>;
