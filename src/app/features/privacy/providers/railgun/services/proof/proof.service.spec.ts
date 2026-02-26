import { TestBed } from '@angular/core/testing';

import { ProofService } from './proof.service';

describe('ProofService', () => {
  let service: ProofService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProofService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
