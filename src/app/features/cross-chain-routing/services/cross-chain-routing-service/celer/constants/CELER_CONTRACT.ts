import {
  BLOCKCHAIN_NAME,
  EthLikeBlockchainName
} from '@app/shared/models/blockchain/blockchain-name';

export const CELER_CONTRACT: Partial<Record<EthLikeBlockchainName, string>> = {
  [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: '0x3064fB040cC9cF661E013492C0C30be341A2d0e0',
  [BLOCKCHAIN_NAME.AVALANCHE]: '0xB049EeD236Da46529DaF589f21FeD81888006F76'
};
