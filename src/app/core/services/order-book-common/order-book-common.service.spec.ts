import { TestBed } from '@angular/core/testing';

import { OrderBookCommonService } from './order-book-common.service';

describe('OrderBookService', () => {
  let service: OrderBookCommonService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrderBookCommonService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
