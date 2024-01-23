import { TestBed } from '@angular/core/testing';

import { SwapsFormService } from './swaps-form.service';

describe('SwapsFormService', () => {
  let service: SwapsFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SwapsFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
