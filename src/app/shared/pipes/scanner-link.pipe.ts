import { Pipe, PipeTransform } from '@angular/core';
import { NATIVE_TOKEN_ADDRESS } from 'src/app/shared/constants/blockchain/NATIVE_TOKEN_ADDRESS';
import { BlockchainPublicService } from 'src/app/core/services/blockchain/blockchain-public/blockchain-public.service';
import { SCANNERS } from 'src/app/shared/pipes/models/scanners';
import { BLOCKCHAIN_NAME } from '../models/blockchain/BLOCKCHAIN_NAME';
import ADDRESS_TYPE from '../models/blockchain/ADDRESS_TYPE';
import { UseTestingModeService } from '../../core/services/use-testing-mode/use-testing-mode.service';

/**
 * Transforms scanner url.
 */
@Pipe({ name: 'scannerLink' })
export class ScannerLinkPipe implements PipeTransform {
  private isTestingMode = false;

  constructor(
    private readonly blockchainPublicService: BlockchainPublicService,
    private readonly useTestingMode: UseTestingModeService
  ) {
    useTestingMode.isTestingMode.subscribe(value => (this.isTestingMode = value));
  }

  /**
   * Transforms scanner link.
   * @param address Scanner address.
   * @param blockchainName Blockchain name.
   * @param type Address type.
   */
  public transform(address: string, blockchainName: BLOCKCHAIN_NAME, type: ADDRESS_TYPE): string {
    if (!address || !blockchainName) {
      return '';
    }

    return this.setupUrl(address, blockchainName, type);
  }

  /**
   * Sets scanner url based on scanner element object params.
   * @param address Scanner address.
   * @param blockchainName Blockchain name.
   * @param type Address type.
   * @private
   */
  private setupUrl(address: string, blockchainName: BLOCKCHAIN_NAME, type: ADDRESS_TYPE): string {
    const scannerElement = SCANNERS[blockchainName];

    let url = !this.isTestingMode
      ? scannerElement.baseUrl
      : SCANNERS[`${blockchainName}_TESTNET` as BLOCKCHAIN_NAME].baseUrl;

    if (address === NATIVE_TOKEN_ADDRESS) {
      url = `${url}${scannerElement.nativeCoinUrl}`;
    } else {
      url = `${url}${scannerElement[type]}${address}`;
    }

    if (scannerElement.queryParam) {
      const { key, value } = scannerElement.queryParam;
      url = `${url}?${key}=${value}`;
    }
    return url;
  }
}
