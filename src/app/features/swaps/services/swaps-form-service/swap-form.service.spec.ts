import { TestBed } from '@angular/core/testing';

import { SwapFormService } from './swap-form.service';

describe('SwapFormService', () => {
  let service: SwapFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SwapFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
