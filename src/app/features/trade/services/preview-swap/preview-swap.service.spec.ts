import { TestBed } from '@angular/core/testing';

import { PreviewSwapService } from './preview-swap.service';

describe('PreviewSwapService', () => {
  let service: PreviewSwapService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PreviewSwapService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
