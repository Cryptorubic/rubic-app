import { TestBed } from '@angular/core/testing';

import { GetBnbService } from './get-bnb.service';

describe('GetBnbService', () => {
  let service: GetBnbService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GetBnbService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
