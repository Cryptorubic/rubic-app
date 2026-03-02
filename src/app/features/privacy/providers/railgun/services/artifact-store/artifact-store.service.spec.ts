import { TestBed } from '@angular/core/testing';

import { ArtifactStoreService } from './artifact-store.service';

describe('ArtifactStoreService', () => {
  let service: ArtifactStoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ArtifactStoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
