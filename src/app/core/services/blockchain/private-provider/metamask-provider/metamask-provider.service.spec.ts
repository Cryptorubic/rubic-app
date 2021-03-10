import { TestBed } from '@angular/core/testing';

import { MetamaskProviderService } from './metamask-provider.service';

describe('ProviderService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MetamaskProviderService = TestBed.get(MetamaskProviderService);

    expect(service).toBeTruthy();
  });
});
