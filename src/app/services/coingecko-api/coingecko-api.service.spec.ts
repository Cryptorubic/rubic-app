import { TestBed } from '@angular/core/testing';

import { CoingeckoApiService } from './coingecko-api.service';

describe('CoingeckoApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CoingeckoApiService = TestBed.get(CoingeckoApiService);
    expect(service).toBeTruthy();
  });
});
