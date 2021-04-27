import { TestBed } from '@angular/core/testing';

import { PanamaBridgeProviderService } from './panama-bridge-provider.service';

describe('BinanceBridgeProviderService', () => {
  let service: PanamaBridgeProviderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PanamaBridgeProviderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
