import { TestBed } from '@angular/core/testing';

import { BridgeApiService } from './bridge-api.service';

describe('BackendApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: BridgeApiService = TestBed.get(BridgeApiService);

    expect(service).toBeTruthy();
  });
});
