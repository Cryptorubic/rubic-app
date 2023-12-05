import { TestBed } from '@angular/core/testing';

import { OnChainService } from './on-chain.service';

describe('OnChainService', () => {
  let service: OnChainService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OnChainService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
