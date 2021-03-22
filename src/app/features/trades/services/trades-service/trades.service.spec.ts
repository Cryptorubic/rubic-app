import { TestBed } from '@angular/core/testing';

import { TradesService } from './trades.service';

describe('TradesService', () => {
  let service: TradesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TradesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
