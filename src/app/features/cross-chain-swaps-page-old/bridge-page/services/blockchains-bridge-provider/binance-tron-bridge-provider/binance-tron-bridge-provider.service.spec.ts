import { TestBed } from '@angular/core/testing';

import { BinanceTronBridgeProviderService } from './binance-tron-bridge-provider.service';

describe('BinanceTronBridgeProviderService', () => {
  let service: BinanceTronBridgeProviderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BinanceTronBridgeProviderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
