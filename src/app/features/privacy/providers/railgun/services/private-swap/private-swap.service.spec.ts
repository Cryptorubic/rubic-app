import { TestBed } from '@angular/core/testing';

import { PrivateSwapService } from './private-swap.service';

describe('PrivateSwapService', () => {
  let service: PrivateSwapService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PrivateSwapService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
