import { TestBed } from '@angular/core/testing';

import { EthereumTronBridgeProviderService } from './ethereum-tron-bridge-provider.service';

describe('EthereumTronBridgeProviderService', () => {
  let service: EthereumTronBridgeProviderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EthereumTronBridgeProviderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
