import {
  BLOCKCHAIN_NAME,
  EthLikeBlockchainName
} from '@app/shared/models/blockchain/blockchain-name';

export const CELER_CONTRACT: Partial<Record<EthLikeBlockchainName, string>> = {
  [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: '0xFE014B8aF16a619fCB852AF486CdEbfDE6A6B46a',
  [BLOCKCHAIN_NAME.POLYGON]: '0xDA294FDE76F7369ed93D7C7A3FD2d5277C2003B5'
};
