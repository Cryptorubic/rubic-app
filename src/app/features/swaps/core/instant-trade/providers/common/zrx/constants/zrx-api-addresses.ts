import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';
import { SupportedZrxBlockchain } from '@features/swaps/core/instant-trade/providers/common/zrx/constants/supported-zrx-blockchain';

export const ZRX_API_ADDRESS: Record<SupportedZrxBlockchain, string> = {
  [BLOCKCHAIN_NAME.ETHEREUM]: 'https://api.0x.org/'
  // [BlockchainName.BINANCE_SMART_CHAIN]: 'https://bsc.api.0x.org/',
  // [BlockchainName.POLYGON]: 'https://polygon.api.0x.org/'
};
