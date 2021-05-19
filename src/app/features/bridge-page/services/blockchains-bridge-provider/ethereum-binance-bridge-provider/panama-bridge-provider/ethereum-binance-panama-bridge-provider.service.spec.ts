import { TestBed } from '@angular/core/testing';

import { EthereumBinancePanamaBridgeProviderService } from './ethereum-binance-panama-bridge-provider.service';

describe('BinanceBridgeProviderService', () => {
  let service: EthereumBinancePanamaBridgeProviderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EthereumBinancePanamaBridgeProviderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
