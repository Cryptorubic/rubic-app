import { TestBed } from '@angular/core/testing';

import { CommonTableService } from './common-table.service';

describe('CommonTableService', () => {
  let service: CommonTableService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CommonTableService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
