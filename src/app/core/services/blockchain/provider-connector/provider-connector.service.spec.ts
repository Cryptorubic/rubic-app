import { TestBed } from '@angular/core/testing';

import { ProviderConnectorService } from './provider-connector.service';

describe('ProviderConnectorService', () => {
  let service: ProviderConnectorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProviderConnectorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
