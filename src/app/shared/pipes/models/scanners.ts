import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import ADDRESS_TYPE from 'src/app/shared/models/blockchain/ADDRESS_TYPE';

interface QueryParam {
  key: string;
  value: string;
}

interface BaseScannerOptions {
  baseUrl: string;
  nativeCoinUrl: string;
  queryParam?: QueryParam;
}

type AddressTypeOptions = { [T in ADDRESS_TYPE]: string };

export type ScannerElement = BaseScannerOptions & AddressTypeOptions;

type Scanner = {
  [T in BLOCKCHAIN_NAME]: ScannerElement;
};

export const SCANNERS: Scanner = {
  [BLOCKCHAIN_NAME.ETHEREUM]: {
    baseUrl: 'https://etherscan.io/',
    nativeCoinUrl: 'stat/supply/',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: 'token/',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.ETHEREUM_TESTNET]: {
    baseUrl: 'https://kovan.etherscan.io/',
    nativeCoinUrl: 'stat/supply/',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: 'token/',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: {
    baseUrl: 'https://bscscan.com/',
    nativeCoinUrl: 'stat/supply/',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: 'token/',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN_TESTNET]: {
    baseUrl: 'https://testnet.bscscan.com/',
    nativeCoinUrl: 'stat/supply/',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: 'token/',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.POLYGON]: {
    baseUrl: 'https://polygonscan.com/',
    nativeCoinUrl: 'stat/supply/',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: 'token/',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.POLYGON_TESTNET]: {
    baseUrl: 'https://https://mumbai.polygonscan.com/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: 'token/',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.TRON]: {
    baseUrl: 'https://tronscan.org/#/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: 'token20/',
    [ADDRESS_TYPE.TRANSACTION]: 'transaction/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.XDAI]: {
    baseUrl: 'https://blockscout.com/xdai/mainnet/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: 'tokens/',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.HARMONY]: {
    baseUrl: 'https://explorer.harmony.one/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: 'address/',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.AVALANCHE]: {
    baseUrl: 'https://cchain.explorer.avax.network/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: 'address/',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.HARMONY_TESTNET]: {
    baseUrl: 'https://explorer.testnet.harmony.one/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: 'address/',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.AVALANCHE_TESTNET]: {
    baseUrl: 'https://cchain.explorer.avax-test.network',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: 'address/',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  }
};
