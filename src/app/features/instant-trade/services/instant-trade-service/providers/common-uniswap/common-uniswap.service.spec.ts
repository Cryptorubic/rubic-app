import { TestBed } from '@angular/core/testing';

import { CommonUniswapService } from './common-uniswap.service';

describe('CommonUniswapService', () => {
  let service: CommonUniswapService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CommonUniswapService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
