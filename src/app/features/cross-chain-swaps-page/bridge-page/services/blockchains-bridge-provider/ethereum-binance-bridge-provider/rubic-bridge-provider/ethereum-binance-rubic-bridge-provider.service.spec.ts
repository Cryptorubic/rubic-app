import { TestBed } from '@angular/core/testing';

import { EthereumBinanceRubicBridgeProviderService } from './ethereum-binance-rubic-bridge-provider.service';

describe('RubicBridgeService', () => {
  let service: EthereumBinanceRubicBridgeProviderService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EthereumBinanceRubicBridgeProviderService]
    });
    service = TestBed.inject(EthereumBinanceRubicBridgeProviderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
