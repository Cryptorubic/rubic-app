import { TestBed } from '@angular/core/testing';

import { HealthcheckService } from './healthcheck.service';

describe('HealthcheckService', () => {
  let service: HealthcheckService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HealthcheckService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
