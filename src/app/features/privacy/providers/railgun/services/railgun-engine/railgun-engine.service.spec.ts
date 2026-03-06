import { TestBed } from '@angular/core/testing';

import { RailgunEngineService } from './railgun-engine.service';

describe('RailgunEngineService', () => {
  let service: RailgunEngineService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RailgunEngineService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
