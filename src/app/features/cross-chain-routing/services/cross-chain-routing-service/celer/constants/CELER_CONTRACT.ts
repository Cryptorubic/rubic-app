import {
  BLOCKCHAIN_NAME,
  EthLikeBlockchainName
} from '@app/shared/models/blockchain/blockchain-name';

export const CELER_CONTRACT: Partial<Record<EthLikeBlockchainName, string>> = {
  [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: '0x3064fB040cC9cF661E013492C0C30be341A2d0e0',
  [BLOCKCHAIN_NAME.POLYGON]: '0x53dC7535028e2fcaCa0d847AD108b9240C0801b1'
};
