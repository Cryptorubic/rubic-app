import { TestBed } from '@angular/core/testing';

import { HideService } from './hide.service';

describe('HideService', () => {
  let service: HideService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HideService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
