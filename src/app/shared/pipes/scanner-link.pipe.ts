import { Pipe, PipeTransform } from '@angular/core';
import { BLOCKCHAIN_NAME } from '../models/blockchain/BLOCKCHAIN_NAME';
import ADDRESS_TYPE from '../models/blockchain/ADDRESS_TYPE';
import { BlockchainsInfo } from '../../core/services/blockchain/blockchain-info';
import { Web3PublicService } from '../../core/services/blockchain/web3-public-service/web3-public.service';
import { Web3Public } from '../../core/services/blockchain/web3-public-service/Web3Public';
import { UseTestingModeService } from '../../core/services/use-testing-mode/use-testing-mode.service';

const urlPaths = {
  [ADDRESS_TYPE.WALLET]: 'address/',
  [ADDRESS_TYPE.TOKEN]: 'token/',
  [ADDRESS_TYPE.TRANSACTION]: 'tx/'
};

const nativeCoinUrl = 'stat/supply/';

@Pipe({ name: 'scannerLink' })
export class ScannerLinkPipe implements PipeTransform {
  private isTestingMode = false;

  constructor(private web3PublicService: Web3PublicService, useTestingMode: UseTestingModeService) {
    useTestingMode.isTestingMode.subscribe(value => (this.isTestingMode = value));
  }

  transform(address, blockchainName: BLOCKCHAIN_NAME, type: ADDRESS_TYPE) {
    if (this.isTestingMode && !blockchainName.includes('_TESTNET')) {
      // @ts-ignore
      blockchainName = BlockchainsInfo.getBlockchainByName(`${blockchainName.toString()}_TESTNET`)
        .name;
    }
    const web3Public: Web3Public = this.web3PublicService[blockchainName];

    const baseUrl = BlockchainsInfo.getBlockchainByName(blockchainName).scannerUrl;

    if (web3Public.isNativeAddress(address)) {
      return baseUrl + nativeCoinUrl;
    }

    if (blockchainName === BLOCKCHAIN_NAME.MATIC && type === ADDRESS_TYPE.TOKEN) {
      return baseUrl + urlPaths[ADDRESS_TYPE.WALLET] + address;
    }

    return baseUrl + urlPaths[type] + address;
  }
}
