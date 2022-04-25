import { BlockchainName, BLOCKCHAIN_NAME } from '@app/shared/models/blockchain/blockchain-name';

export const CELER_TRANSIT_TOKENS: Partial<Record<BlockchainName, string[]>> = {
  [BLOCKCHAIN_NAME.FANTOM]: ['0x04068da6c83afcfa0e13ba15a6696662335d5b75'],
  [BLOCKCHAIN_NAME.AVALANCHE]: ['0xa7d7079b0fead91f3e65f86e8915cb59c1a4c664']
};
