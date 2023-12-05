import { TestBed } from '@angular/core/testing';

import { CnSwapService } from './cn-swap.service';

describe('CnSwapService', () => {
  let service: CnSwapService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CnSwapService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
