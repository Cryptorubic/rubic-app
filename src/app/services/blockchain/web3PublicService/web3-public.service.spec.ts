import { TestBed } from '@angular/core/testing';

import { Web3PublicService } from './web3-public.service';

describe('Web3PublicService', () => {
  let service: Web3PublicService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Web3PublicService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
