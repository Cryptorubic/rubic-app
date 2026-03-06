import { TestBed } from '@angular/core/testing';

import { RailgunService } from './railgun.service';

describe('RailgunService', () => {
  let service: RailgunService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RailgunService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
