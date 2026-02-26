import { TestBed } from '@angular/core/testing';

import { PrivateModalService } from './private-modal.service';

describe('PrivateModalService', () => {
  let service: PrivateModalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PrivateModalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
