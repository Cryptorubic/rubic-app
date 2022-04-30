import {
  BLOCKCHAIN_NAME,
  EthLikeBlockchainName
} from '@app/shared/models/blockchain/blockchain-name';

export const CELER_CONTRACT: Partial<Record<EthLikeBlockchainName, string>> = {
  [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: '0x102a5Db39cB798d5a74eb90405E5CFb14Dd8005F',
  [BLOCKCHAIN_NAME.POLYGON]: '0xF51833eD84c95ebC9D42288b7e0A8DD49F432aA8'
};
