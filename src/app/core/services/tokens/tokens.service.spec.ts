import { TestBed } from '@angular/core/testing';

import { TokensService } from './tokens.service';

describe('TokensService', () => {
  let service: TokensService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TokensService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
