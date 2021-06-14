import { TestBed } from '@angular/core/testing';

import { InstantTradesSwapProviderService } from './instant-trades-swap-provider.service';

describe('InstantTradesSwapProviderService', () => {
  let service: InstantTradesSwapProviderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InstantTradesSwapProviderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
