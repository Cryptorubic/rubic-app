import { TestBed } from '@angular/core/testing';

import { ErrorsOldService } from './errors-old.service';

describe('ErrorsService', () => {
  let service: ErrorsOldService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ErrorsOldService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
