import { TestBed } from '@angular/core/testing';

import { InstantTradeService } from './instant-trade.service';

describe('InstantTradeService', () => {
  let service: InstantTradeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InstantTradeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
