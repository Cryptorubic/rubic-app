import { TestBed } from '@angular/core/testing';

import { RubicBridgeProviderService } from './rubic-bridge-provider.service';

describe('RubicBridgeService', () => {
  let service: RubicBridgeProviderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RubicBridgeProviderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
