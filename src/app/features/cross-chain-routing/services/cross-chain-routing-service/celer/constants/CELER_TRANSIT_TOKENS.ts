import { BlockchainName, BLOCKCHAIN_NAME } from '@app/shared/models/blockchain/blockchain-name';

export const CELER_TRANSIT_TOKENS: Partial<Record<BlockchainName, string[]>> = {
  [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: ['0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d'],
  [BLOCKCHAIN_NAME.AVALANCHE]: ['0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664']
};
