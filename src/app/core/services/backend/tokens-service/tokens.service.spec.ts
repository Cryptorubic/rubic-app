import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { TokensService } from './tokens.service';

describe('TokensService', () => {
  let service: TokensService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
      providers: [TokensService]
    });
    service = TestBed.inject(TokensService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
