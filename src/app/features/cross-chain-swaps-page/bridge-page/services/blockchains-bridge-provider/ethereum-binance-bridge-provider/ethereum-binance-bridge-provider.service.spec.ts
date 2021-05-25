import { TestBed } from '@angular/core/testing';

import { EthereumBinanceBridgeProviderService } from './ethereum-binance-bridge-provider.service';

describe('BinanceBridgeProviderService', () => {
  let service: EthereumBinanceBridgeProviderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EthereumBinanceBridgeProviderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
