import { TestBed } from '@angular/core/testing';

import { RailgunTransferService } from './railgun-transfer.service';

describe('RailgunTransferService', () => {
  let service: RailgunTransferService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RailgunTransferService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
