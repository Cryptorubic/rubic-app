import { TestBed } from '@angular/core/testing';

import { InstantTradeFormService } from 'src/app/features/instant-trade/services/instant-trade-form-service/instant-trade-form.service';

describe('InstantTradeFormService', () => {
  let service: InstantTradeFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InstantTradeFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
