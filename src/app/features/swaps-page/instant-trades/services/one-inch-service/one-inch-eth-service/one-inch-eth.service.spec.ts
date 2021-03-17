import { TestBed } from '@angular/core/testing';

import { OneInchEthService } from './one-inch-eth.service';

describe('OneInchEthServiceService', () => {
  let service: OneInchEthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OneInchEthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
