import { TestBed } from '@angular/core/testing';

import { TradePageService } from './trade-page.service';

describe('TradePageService', () => {
  let service: TradePageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TradePageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
