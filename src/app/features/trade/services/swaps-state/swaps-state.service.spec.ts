import { TestBed } from '@angular/core/testing';

import { SwapsStateService } from './swaps-state.service';

describe('SwapsStateService', () => {
  let service: SwapsStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SwapsStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
