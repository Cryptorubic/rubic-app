import { TestBed } from '@angular/core/testing';

import { UseTestingModeService } from './use-testing-mode.service';

describe('UseTestingModeService', () => {
  let service: UseTestingModeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UseTestingModeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
