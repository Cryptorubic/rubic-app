import { TestBed } from '@angular/core/testing';

import { BridgeService } from 'src/app/features/bridge/services/bridge-service/bridge.service';

describe('BridgeService', () => {
  let service: BridgeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BridgeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
