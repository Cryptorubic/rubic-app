import { TestBed } from '@angular/core/testing';

import { Web3ApiService } from './web3-api.service';

describe('Web3ApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: Web3ApiService = TestBed.get(Web3ApiService);
    expect(service).toBeTruthy();
  });
});
