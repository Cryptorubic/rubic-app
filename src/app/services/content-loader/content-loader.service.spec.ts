import { TestBed } from '@angular/core/testing';

import { ContentLoaderService } from './content-loader.service';

describe('ContentLoaderService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ContentLoaderService = TestBed.get(ContentLoaderService);
    expect(service).toBeTruthy();
  });
});
