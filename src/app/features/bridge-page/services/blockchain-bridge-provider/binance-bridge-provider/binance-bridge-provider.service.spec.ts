import { TestBed } from '@angular/core/testing';

import { BinanceBridgeProviderService } from './binance-bridge-provider.service';

describe('BinanceBridgeProviderService', () => {
  let service: BinanceBridgeProviderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BinanceBridgeProviderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
