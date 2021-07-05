import { TestBed } from '@angular/core/testing';

import { BridgeFormService } from './bridge-form.service';

describe('BridgeFormService', () => {
  let service: BridgeFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BridgeFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
