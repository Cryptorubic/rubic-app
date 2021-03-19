import { TestBed } from '@angular/core/testing';

import { OrderVooksTableService } from './order-vooks-table.service';

describe('OrderVooksTableService', () => {
  let service: OrderVooksTableService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrderVooksTableService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
