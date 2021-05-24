import { TestBed } from '@angular/core/testing';

import { EthereumPolygonBridgeProviderService } from './ethereum-polygon-bridge-provider.service';

describe('MaticBridgeProviderService', () => {
  let service: EthereumPolygonBridgeProviderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EthereumPolygonBridgeProviderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
