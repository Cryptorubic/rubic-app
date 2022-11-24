import { BlockchainName } from 'rubic-sdk';

export type NonOnChainNetworks = 'BITGERT' | 'ASTAR' | 'BITCOIN' | 'DEFIKINGDOMS';

export type SupportedOnChainNetworks = Exclude<BlockchainName, NonOnChainNetworks>;
