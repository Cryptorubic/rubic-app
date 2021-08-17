import { Pipe, PipeTransform } from '@angular/core';
import { NATIVE_TOKEN_ADDRESS } from 'src/app/shared/constants/blockchain/NATIVE_TOKEN_ADDRESS';
import { BLOCKCHAIN_NAME } from '../models/blockchain/BLOCKCHAIN_NAME';
import ADDRESS_TYPE from '../models/blockchain/ADDRESS_TYPE';
import { Web3PublicService } from '../../core/services/blockchain/web3-public-service/web3-public.service';
import { UseTestingModeService } from '../../core/services/use-testing-mode/use-testing-mode.service';

const blockchainsScanners = {
  [BLOCKCHAIN_NAME.ETHEREUM]: {
    baseUrl: 'https://etherscan.io/',
    nativeCoinUrl: 'stat/supply/',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: 'token/',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/'
  },
  [BLOCKCHAIN_NAME.ETHEREUM_TESTNET]: {
    baseUrl: 'https://kovan.etherscan.io/',
    nativeCoinUrl: 'stat/supply/'
  },
  [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: {
    baseUrl: 'https://bscscan.com/',
    nativeCoinUrl: 'stat/supply/',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: 'token/',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/'
  },
  [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN_TESTNET]: {
    baseUrl: 'https://testnet.bscscan.com/',
    nativeCoinUrl: 'stat/supply/'
  },
  [BLOCKCHAIN_NAME.POLYGON]: {
    baseUrl: 'https://polygonscan.com/',
    nativeCoinUrl: 'stat/supply/',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: 'token/',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/'
  },
  [BLOCKCHAIN_NAME.POLYGON_TESTNET]: {
    baseUrl: 'https://explorer-mumbai.maticvigil.com/',
    nativeCoinUrl: ''
  },
  [BLOCKCHAIN_NAME.TRON]: {
    baseUrl: 'https://tronscan.org/#/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: 'token20/',
    [ADDRESS_TYPE.TRANSACTION]: 'transaction/'
  },
  [BLOCKCHAIN_NAME.XDAI]: {
    baseUrl: 'https://blockscout.com/xdai/mainnet/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: 'tokens/',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/'
  },
  [BLOCKCHAIN_NAME.HARMONY]: {
    baseUrl: 'https://explorer.harmony.one/',
    nativeCoinUrl: '',
    [ADDRESS_TYPE.WALLET]: 'address/',
    [ADDRESS_TYPE.TOKEN]: 'address/',
    [ADDRESS_TYPE.TRANSACTION]: 'tx/'
  }
};

@Pipe({ name: 'scannerLink' })
export class ScannerLinkPipe implements PipeTransform {
  private isTestingMode = false;

  constructor(private web3PublicService: Web3PublicService, useTestingMode: UseTestingModeService) {
    useTestingMode.isTestingMode.subscribe(value => (this.isTestingMode = value));
  }

  transform(address, blockchainName: BLOCKCHAIN_NAME, type: ADDRESS_TYPE): string {
    if (!address || !blockchainName) {
      return '';
    }

    const baseUrl = !this.isTestingMode
      ? blockchainsScanners[blockchainName].baseUrl
      : blockchainsScanners[`${blockchainName}_TESTNET`].baseUrl;

    if (address === NATIVE_TOKEN_ADDRESS) {
      return baseUrl + blockchainsScanners[blockchainName].nativeCoinUrl;
    }
    return baseUrl + blockchainsScanners[blockchainName][type] + address;
  }
}
