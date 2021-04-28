import { TestBed } from '@angular/core/testing';

import { PolygonBridgeProviderService } from './polygon-bridge-provider.service';

describe('MaticBridgeProviderService', () => {
  let service: PolygonBridgeProviderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PolygonBridgeProviderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
