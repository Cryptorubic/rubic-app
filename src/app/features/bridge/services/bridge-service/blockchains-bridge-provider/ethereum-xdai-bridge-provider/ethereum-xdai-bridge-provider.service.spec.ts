import { TestBed } from '@angular/core/testing';

import { EthereumXdaiBridgeProviderService } from './ethereum-xdai-bridge-provider.service';

describe('EthereumXdaiBridgeProviderService', () => {
  let service: EthereumXdaiBridgeProviderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EthereumXdaiBridgeProviderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
