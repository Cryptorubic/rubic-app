import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { TokensApiService } from 'src/app/core/services/backend/tokens-api/tokens-api.service';

describe('TokensApiService', () => {
  let service: TokensApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
      providers: [TokensApiService]
    });
    service = TestBed.inject(TokensApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
