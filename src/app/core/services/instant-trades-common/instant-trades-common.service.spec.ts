import { TestBed } from '@angular/core/testing';

import { InstantTradesCommonService } from './instant-trades-common.service';

describe('InstantTradesCommonService', () => {
  let service: InstantTradesCommonService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InstantTradesCommonService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
