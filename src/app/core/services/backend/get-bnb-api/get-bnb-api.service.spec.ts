import { TestBed } from '@angular/core/testing';

import { GetBnbApiService } from './get-bnb-api.service';

describe('GetBnbApiService', () => {
  let service: GetBnbApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GetBnbApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
