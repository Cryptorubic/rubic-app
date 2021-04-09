import { TestBed } from '@angular/core/testing';

import { QuickSwapService } from './quick-swap.service';

describe('QuickSwapService', () => {
  let service: QuickSwapService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QuickSwapService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
