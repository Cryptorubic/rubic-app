import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { OrderBookApiService } from './order-book-api.service';

describe('OrderBookApiService', () => {
  let service;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule]
    });
    service = TestBed.inject(OrderBookApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
