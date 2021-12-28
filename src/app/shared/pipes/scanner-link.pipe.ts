import { Pipe, PipeTransform } from '@angular/core';
import { NativeTokenAddress } from '@shared/constants/blockchain/native-token-address';
import { PublicBlockchainAdapterService } from '@core/services/blockchain/blockchain-adapters/public-blockchain-adapter.service';
import { UseTestingModeService } from '@core/services/use-testing-mode/use-testing-mode.service';
import {
  BLOCKCHAIN_NAME,
  DEPRECATED_BLOCKCHAIN_NAME
} from '@shared/models/blockchain/blockchain-name';
import AddressType from 'src/app/shared/models/blockchain/address-type';

const blockchainsScanners = {
  [BLOCKCHAIN_NAME.ETHEREUM]: {
    baseUrl: 'https://etherscan.io/',
    nativeCoinUrl: 'stat/supply/',
    [AddressType.WALLET]: 'address/',
    [AddressType.TOKEN]: 'token/',
    [AddressType.TRANSACTION]: 'tx/',
    [AddressType.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.ETHEREUM_TESTNET]: {
    baseUrl: 'https://kovan.etherscan.io/',
    nativeCoinUrl: 'stat/supply/',
    [AddressType.WALLET]: 'address/',
    [AddressType.TOKEN]: 'token/',
    [AddressType.TRANSACTION]: 'tx/',
    [AddressType.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: {
    baseUrl: 'https://bscscan.com/',
    nativeCoinUrl: 'stat/supply/',
    [AddressType.WALLET]: 'address/',
    [AddressType.TOKEN]: 'token/',
    [AddressType.TRANSACTION]: 'tx/',
    [AddressType.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN_TESTNET]: {
    baseUrl: 'https://testnet.bscscan.com/',
    nativeCoinUrl: 'stat/supply/',
    [AddressType.WALLET]: 'address/',
    [AddressType.TOKEN]: 'token/',
    [AddressType.TRANSACTION]: 'tx/',
    [AddressType.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.POLYGON]: {
    baseUrl: 'https://polygonscan.com/',
    nativeCoinUrl: 'stat/supply/',
    [AddressType.WALLET]: 'address/',
    [AddressType.TOKEN]: 'token/',
    [AddressType.TRANSACTION]: 'tx/',
    [AddressType.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.POLYGON_TESTNET]: {
    baseUrl: 'https://https://mumbai.polygonscan.com/',
    nativeCoinUrl: '',
    [AddressType.WALLET]: 'address/',
    [AddressType.TOKEN]: 'token/',
    [AddressType.TRANSACTION]: 'tx/',
    [AddressType.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.XDAI]: {
    baseUrl: 'https://blockscout.com/xdai/mainnet/',
    nativeCoinUrl: '',
    [AddressType.WALLET]: 'address/',
    [AddressType.TOKEN]: 'tokens/',
    [AddressType.TRANSACTION]: 'tx/',
    [AddressType.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.HARMONY]: {
    baseUrl: 'https://explorer.harmony.one/',
    nativeCoinUrl: '',
    [AddressType.WALLET]: 'address/',
    [AddressType.TOKEN]: 'address/',
    [AddressType.TRANSACTION]: 'tx/',
    [AddressType.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.AVALANCHE]: {
    baseUrl: 'https://snowtrace.io/',
    nativeCoinUrl: '',
    [AddressType.WALLET]: 'address/',
    [AddressType.TOKEN]: 'token/',
    [AddressType.TRANSACTION]: 'tx/',
    [AddressType.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.MOONRIVER]: {
    baseUrl: 'https://moonriver.moonscan.io/',
    nativeCoinUrl: '',
    [AddressType.WALLET]: 'address/',
    [AddressType.TOKEN]: 'address/',
    [AddressType.TRANSACTION]: 'tx/',
    [AddressType.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.HARMONY_TESTNET]: {
    baseUrl: 'https://explorer.testnet.harmony.one/',
    nativeCoinUrl: '',
    [AddressType.WALLET]: 'address/',
    [AddressType.TOKEN]: 'address/',
    [AddressType.TRANSACTION]: 'tx/',
    [AddressType.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.AVALANCHE_TESTNET]: {
    baseUrl: 'https://cchain.explorer.avax-test.network',
    nativeCoinUrl: '',
    [AddressType.WALLET]: 'address/',
    [AddressType.TOKEN]: 'address/',
    [AddressType.TRANSACTION]: 'tx/',
    [AddressType.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.FANTOM]: {
    baseUrl: 'https://ftmscan.com/',
    nativeCoinUrl: '',
    [AddressType.WALLET]: 'address/',
    [AddressType.TOKEN]: 'address/',
    [AddressType.TRANSACTION]: 'tx/',
    [AddressType.BLOCK]: 'block/'
  },
  [DEPRECATED_BLOCKCHAIN_NAME.TRON]: {
    baseUrl: 'https://tronscan.org/#/',
    nativeCoinUrl: '',
    [AddressType.WALLET]: 'address/',
    [AddressType.TOKEN]: 'token20/',
    [AddressType.TRANSACTION]: 'transaction/',
    [AddressType.BLOCK]: 'block/'
  },
  [BLOCKCHAIN_NAME.SOLANA]: {
    baseUrl: 'https://solscan.io/',
    nativeCoinUrl: '',
    [AddressType.WALLET]: 'address/',
    [AddressType.TOKEN]: 'token/',
    [AddressType.TRANSACTION]: 'tx/',
    [AddressType.BLOCK]: 'block/'
  }
};

@Pipe({ name: 'scannerLink' })
export class ScannerLinkPipe implements PipeTransform {
  private isTestingMode = false;

  constructor(
    private web3PublicService: PublicBlockchainAdapterService,
    useTestingMode: UseTestingModeService
  ) {
    useTestingMode.isTestingMode.subscribe(value => (this.isTestingMode = value));
  }

  transform(
    address: string,
    blockchainName: BLOCKCHAIN_NAME | DEPRECATED_BLOCKCHAIN_NAME,
    type: AddressType
  ): string {
    if (!address || !blockchainName) {
      return '';
    }

    const baseUrl =
      !this.isTestingMode || blockchainName.includes('_TESTNET')
        ? blockchainsScanners[blockchainName].baseUrl
        : blockchainsScanners[`${blockchainName}_TESTNET` as BLOCKCHAIN_NAME].baseUrl;

    if (address === NativeTokenAddress) {
      return baseUrl + blockchainsScanners[blockchainName].nativeCoinUrl;
    }
    return baseUrl + blockchainsScanners[blockchainName][type] + address;
  }
}
