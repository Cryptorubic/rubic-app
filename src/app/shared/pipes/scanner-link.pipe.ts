import { Pipe, PipeTransform } from '@angular/core';
import { NATIVE_TOKEN_ADDRESS } from '@shared/constants/blockchain/native-token-address';
import { BLOCKCHAIN_NAME, BlockchainName } from '@shared/models/blockchain/blockchain-name';
import ADDRESS_TYPE from 'src/app/shared/models/blockchain/address-type';

const blockchainsScanners = {
  [BLOCKCHAIN_NAME.ETHEREUM]: {
    baseUrl: 'https://etherscan.io/',
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
  [BLOCKCHAIN_NAME.POLYGON]: {
    baseUrl: 'https://polygonscan.com/',
    nativeCoinUrl: 'stat/supply/',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: 'token/',
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
    baseUrl: 'https://snowtrace.io/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: 'token/',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.MOONRIVER]: {
    baseUrl: 'https://moonriver.moonscan.io/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: 'address/',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.FANTOM]: {
    baseUrl: 'https://ftmscan.com/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: 'address/',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.ARBITRUM]: {
    baseUrl: 'https://arbiscan.io/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: 'address/',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.AURORA]: {
    baseUrl: 'https://explorer.mainnet.aurora.dev/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: 'address/',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.SOLANA]: {
    baseUrl: 'https://solscan.io/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: 'token/',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/',
    [ADDRESS_TYPE.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.NEAR]: {
    baseUrl: 'https://explorer.near.org/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'accounts/',
    [ADDRESS_TYPE.TOKEN]: 'accounts/',
    [ADDRESS_TYPE.TRANSACTION]: 'transactions/',
    [ADDRESS_TYPE.BLOCK]: 'blocks/'
  }
};

@Pipe({ name: 'scannerLink' })
export class ScannerLinkPipe implements PipeTransform {
  constructor() {}

  transform(address: string, blockchainName: BlockchainName, type: ADDRESS_TYPE): string {
    if (!address || !blockchainName) {
      return '';
    }

    const baseUrl = blockchainsScanners[blockchainName].baseUrl;

    if (address === NATIVE_TOKEN_ADDRESS) {
      return baseUrl + blockchainsScanners[blockchainName].nativeCoinUrl;
    }
    return baseUrl + blockchainsScanners[blockchainName][type] + address;
  }
}
