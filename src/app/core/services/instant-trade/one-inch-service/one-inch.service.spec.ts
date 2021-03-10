import { TestBed } from '@angular/core/testing';

import { OneInchService } from './one-inch.service';

describe('OneInchService', () => {
  let service: OneInchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OneInchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
