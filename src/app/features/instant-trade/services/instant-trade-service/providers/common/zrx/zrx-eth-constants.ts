import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';

export const ZRX_API_ADDRESS = {
  [BLOCKCHAIN_NAME.ETHEREUM]: 'https://api.0x.org/',
  [BLOCKCHAIN_NAME.ETHEREUM_TESTNET]: 'https://kovan.api.0x.org/',
  [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: 'https://bsc.api.0x.org/',
  [BLOCKCHAIN_NAME.POLYGON]: 'https://polygon.api.0x.org/'
};

export const ZRX_NATIVE_TOKEN = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
