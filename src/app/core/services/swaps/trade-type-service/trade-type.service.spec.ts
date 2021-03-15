import { TestBed } from '@angular/core/testing';

import { TradeTypeService } from './trade-type.service';

describe('TradeTypeService', () => {
  let service: TradeTypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TradeTypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
