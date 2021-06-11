import { TestBed } from '@angular/core/testing';

import { TokensSelectService } from './tokens-select.service';

describe('TokensSelectService', () => {
  let service: TokensSelectService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TokensSelectService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
