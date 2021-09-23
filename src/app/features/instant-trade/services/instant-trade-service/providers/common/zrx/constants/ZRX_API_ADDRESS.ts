import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { SupportedZrxBlockchain } from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/zrx/constants/SupportedZrxBlockchain';

export const ZRX_API_ADDRESS: Record<SupportedZrxBlockchain, string> = {
  [BLOCKCHAIN_NAME.ETHEREUM]: 'https://api.0x.org/',
  [BLOCKCHAIN_NAME.ETHEREUM_TESTNET]: 'https://kovan.api.0x.org/',
  [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: 'https://bsc.api.0x.org/',
  [BLOCKCHAIN_NAME.POLYGON]: 'https://polygon.api.0x.org/'
};
