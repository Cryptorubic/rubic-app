import { TestBed } from '@angular/core/testing';

import { PrivateModalsService } from './private-modals.service';

describe('PrivateModalsService', () => {
  let service: PrivateModalsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PrivateModalsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
