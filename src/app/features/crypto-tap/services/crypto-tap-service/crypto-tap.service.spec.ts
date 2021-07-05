import { TestBed } from '@angular/core/testing';

import { CryptoTapService } from './crypto-tap.service';

describe('CryptoTapService', () => {
  let service: CryptoTapService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CryptoTapService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
