import { TestBed } from '@angular/core/testing';

import { Web3ServiceLEGACY } from './web3LEGACY.service';

describe('Web3Service', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: Web3ServiceLEGACY = TestBed.get(Web3ServiceLEGACY);
    expect(service).toBeTruthy();
  });
});
