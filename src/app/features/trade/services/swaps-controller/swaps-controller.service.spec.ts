import { TestBed } from '@angular/core/testing';

import { SwapsControllerService } from './swaps-controller.service';

describe('SwapsControllerService', () => {
  let service: SwapsControllerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SwapsControllerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
