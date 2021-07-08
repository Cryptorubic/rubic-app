import { TestBed } from '@angular/core/testing';

import { SushiSwapService } from './sushi-swap.service';

describe('SushiSwapService', () => {
  let service: SushiSwapService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SushiSwapService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
