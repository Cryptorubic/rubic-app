import { TestBed } from '@angular/core/testing';

import { BridgesSwapProviderService } from './bridges-swap-provider.service';

describe('BridgesSwapProviderService', () => {
  let service: BridgesSwapProviderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BridgesSwapProviderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
