import { TestBed } from '@angular/core/testing';

import { CryptoTapFormService } from './crypto-tap-form.service';

describe('CryptoTapFormService', () => {
  let service: CryptoTapFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CryptoTapFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
