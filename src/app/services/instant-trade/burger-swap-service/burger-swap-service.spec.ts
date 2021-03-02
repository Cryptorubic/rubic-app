import { TestBed } from '@angular/core/testing';

import { BurgerSwapService } from './burger-swap-service';

describe('BurgerSwapServiceService', () => {
  let service: BurgerSwapService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BurgerSwapService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
