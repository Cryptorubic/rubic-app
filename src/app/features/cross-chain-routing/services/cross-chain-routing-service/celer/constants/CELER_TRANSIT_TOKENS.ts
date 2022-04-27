import { BlockchainName, BLOCKCHAIN_NAME } from '@app/shared/models/blockchain/blockchain-name';

export const CELER_TRANSIT_TOKENS: Partial<Record<BlockchainName, string[]>> = {
  [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: ['0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d'],
  [BLOCKCHAIN_NAME.POLYGON]: ['0x2791bca1f2de4661ed88a30c99a7a9449aa84174']
};
