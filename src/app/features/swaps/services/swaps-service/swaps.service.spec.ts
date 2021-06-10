import { TestBed } from '@angular/core/testing';

import { SwapsService } from './swaps.service';

describe('SwapsService', () => {
  let service: SwapsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SwapsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
