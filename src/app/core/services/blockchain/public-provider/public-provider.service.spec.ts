import { TestBed } from '@angular/core/testing';

import { PublicProviderService } from './public-provider.service';

describe('PublicProviderService', () => {
  let service: PublicProviderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PublicProviderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
