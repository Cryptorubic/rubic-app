import { TestBed } from '@angular/core/testing';

import { BalanceControllerService } from './balance-controller.service';

describe('BalanceControllerService', () => {
  let service: BalanceControllerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BalanceControllerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
