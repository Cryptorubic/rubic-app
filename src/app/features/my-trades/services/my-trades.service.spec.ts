import { TestBed } from '@angular/core/testing';

import { MyTradesService } from './my-trades.service';

describe('MyTradesService', () => {
  let service: MyTradesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MyTradesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
