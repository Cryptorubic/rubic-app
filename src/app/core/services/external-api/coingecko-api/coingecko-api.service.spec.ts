import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { CoingeckoApiService } from './coingecko-api.service';

describe('CoingeckoApiService', () => {
  let service;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule]
    });
    service = TestBed.inject(CoingeckoApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
