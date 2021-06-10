import { TestBed } from '@angular/core/testing';

import { InstantTradesFormService } from './instant-trades-form.service';

describe('InstantTradesFormService', () => {
  let service: InstantTradesFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InstantTradesFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
