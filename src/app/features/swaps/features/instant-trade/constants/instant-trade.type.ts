import { BlockchainName } from 'rubic-sdk';

export type NonOnChainNetworks = 'BITGERT' | 'ASTAR' | 'BITCOIN' | 'KLAYTN';

export type SupportedOnChainNetworks = Exclude<BlockchainName, NonOnChainNetworks>;
