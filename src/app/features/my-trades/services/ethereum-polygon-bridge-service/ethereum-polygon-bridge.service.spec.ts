import { TestBed } from '@angular/core/testing';

import { EthereumPolygonBridgeService } from './ethereum-polygon-bridge.service';

describe('EthereumPolygonBridgeService', () => {
  let service: EthereumPolygonBridgeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EthereumPolygonBridgeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
