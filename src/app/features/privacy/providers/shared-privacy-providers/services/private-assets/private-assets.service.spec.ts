import { TestBed } from '@angular/core/testing';

import { PrivateAssetsService } from './private-assets.service';

describe('PrivateAssetsService', () => {
  let service: PrivateAssetsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PrivateAssetsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
