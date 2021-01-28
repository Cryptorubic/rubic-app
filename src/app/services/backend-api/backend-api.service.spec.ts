import { TestBed } from '@angular/core/testing';

import { BackendApiService } from './backend-api.service';

describe('BackendApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: BackendApiService = TestBed.get(BackendApiService);
    expect(service).toBeTruthy();
  });
});
