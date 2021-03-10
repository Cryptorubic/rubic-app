import { TestBed } from '@angular/core/testing';

import { OrderBookApiService } from './order-book-api.service';

describe('OrderBookApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: OrderBookApiService = TestBed.get(OrderBookApiService);

    expect(service).toBeTruthy();
  });
});
