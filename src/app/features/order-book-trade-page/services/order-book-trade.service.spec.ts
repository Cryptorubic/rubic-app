import { TestBed } from '@angular/core/testing';

import { OrderBookTradeService } from './order-book-trade.service';

describe('OrderBookTradeService', () => {
  let service: OrderBookTradeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrderBookTradeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
