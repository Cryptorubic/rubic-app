import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { BridgeService } from './bridge.service';
import { RubicBridgeService } from './rubic-bridge-service/rubic-bridge.service';

describe('BridgeService', () => {
  let service: BridgeService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
      providers: [BridgeService, RubicBridgeService]
    });
    service = TestBed.inject(BridgeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
