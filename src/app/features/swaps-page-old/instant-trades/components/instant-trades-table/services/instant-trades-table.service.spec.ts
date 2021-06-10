import { TestBed } from '@angular/core/testing';

import { InstantTradesTableService } from './instant-trades-table.service';

describe('InstantTradesTableService', () => {
  let service: InstantTradesTableService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InstantTradesTableService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
