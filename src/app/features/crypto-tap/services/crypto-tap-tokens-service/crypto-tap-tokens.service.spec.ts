import { TestBed } from '@angular/core/testing';

import { CryptoTapTokensService } from './crypto-tap-tokens.service';

describe('CryptoTapTokensService', () => {
  let service: CryptoTapTokensService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CryptoTapTokensService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
