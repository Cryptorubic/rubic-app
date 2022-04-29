import {
  BLOCKCHAIN_NAME,
  EthLikeBlockchainName
} from '@app/shared/models/blockchain/blockchain-name';

export const CELER_CONTRACT: Partial<Record<EthLikeBlockchainName, string>> = {
  [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: '0x9B2e82e56FF725944ccAEb8a68D07d18aD74d7C7',
  [BLOCKCHAIN_NAME.POLYGON]: '0x21B4A75a2A69a7394ce1c105355F8F7673bfAde5'
};
