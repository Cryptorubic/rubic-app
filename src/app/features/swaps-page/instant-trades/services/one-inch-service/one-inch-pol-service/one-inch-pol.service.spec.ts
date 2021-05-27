import { TestBed } from '@angular/core/testing';

import { OneInchPolService } from 'src/app/features/swaps-page/instant-trades/services/one-inch-service/one-inch-pol-service/one-inch-pol.service';

describe('OneInchPolServiceService', () => {
  let service: OneInchPolService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OneInchPolService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
