import { BLOCKCHAIN_NAME } from 'rubic-sdk';
import { OnramperSupportedBlockchain } from '@features/swaps/features/onramper-exchange/models/onramper-supported-blockchain';

export const cryptoCode: Record<OnramperSupportedBlockchain, string> = {
  [BLOCKCHAIN_NAME.ETHEREUM]: 'ETH',
  [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: 'BNB_BEP20',
  [BLOCKCHAIN_NAME.POLYGON]: 'MATIC',
  [BLOCKCHAIN_NAME.AVALANCHE]: 'AVAX_CCHAIN'
};
