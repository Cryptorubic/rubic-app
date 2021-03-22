import { TestBed } from '@angular/core/testing';

import { OrderBooksTableService } from './order-books-table.service';

describe('OrderBooksTableService', () => {
  let service: OrderBooksTableService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrderBooksTableService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
