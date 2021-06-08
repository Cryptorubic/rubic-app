import { TestBed } from '@angular/core/testing';

import { MetamaskProvider } from './metamask-provider';

describe('ProviderService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MetamaskProvider = TestBed.get(MetamaskProvider);

    expect(service).toBeTruthy();
  });
});
