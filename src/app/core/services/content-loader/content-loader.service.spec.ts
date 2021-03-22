import { TestBed } from '@angular/core/testing';

import { ContentLoaderService } from './content-loader.service';

describe('ContentLoaderService', () => {
  let service: ContentLoaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ContentLoaderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
