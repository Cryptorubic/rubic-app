import { TestBed } from '@angular/core/testing';

import { InstantTradeService } from 'src/app/features/instant-trade/services/instant-trade-service/instant-trade.service';

describe('InstantTradeServiceService', () => {
  let service: InstantTradeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InstantTradeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
