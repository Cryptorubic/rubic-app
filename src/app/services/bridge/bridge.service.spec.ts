import { TestBed } from '@angular/core/testing';

import { BridgeService } from './bridge.service';

describe('BridgeService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: BridgeService = TestBed.get(BridgeService);
    expect(service).toBeTruthy();
  });
});
