import { TestBed } from '@angular/core/testing';

import { RubicBridgeService } from './rubic-bridge.service';

describe('RubicBridgeService', () => {
  let service: RubicBridgeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RubicBridgeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
