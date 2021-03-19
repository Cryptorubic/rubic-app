import { TestBed } from '@angular/core/testing';

import { InstantTradesApiService } from './instant-trades-api.service';

describe('InstantTradesApiService', () => {
  let service: InstantTradesApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InstantTradesApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
