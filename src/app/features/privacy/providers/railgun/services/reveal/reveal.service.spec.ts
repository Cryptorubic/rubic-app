import { TestBed } from '@angular/core/testing';

import { RevealService } from './reveal.service';

describe('RevealService', () => {
  let service: RevealService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RevealService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
