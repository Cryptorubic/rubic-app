import { TestBed } from '@angular/core/testing';

import { OneInchBscService } from './one-inch-bsc.service';

describe('OneInchBscServiceService', () => {
  let service: OneInchBscService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OneInchBscService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
