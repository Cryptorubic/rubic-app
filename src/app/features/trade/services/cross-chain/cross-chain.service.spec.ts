import { TestBed } from '@angular/core/testing';

import { CrossChainService } from './cross-chain.service';

describe('CrossChainService', () => {
  let service: CrossChainService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CrossChainService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
