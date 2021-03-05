import { TestBed } from '@angular/core/testing';

import { OrderBookService } from './order-book.service';

describe('OrderBookService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: OrderBookService = TestBed.get(OrderBookService);

    expect(service).toBeTruthy();
  });
});
