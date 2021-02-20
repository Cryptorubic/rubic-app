import { TestBed } from '@angular/core/testing';

import { TokensService } from './tokens.service';

describe('TokensService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TokensService = TestBed.get(TokensService);
    expect(service).toBeTruthy();
  });
});
