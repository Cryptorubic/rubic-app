import { TestBed } from '@angular/core/testing';
import { OneInchBscService } from 'src/app/features/instant-trade/services/instant-trade-service/providers/one-inch-bsc-service/one-inch-bsc.service';

describe('OneInchBscService', () => {
  let service: OneInchBscService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OneInchBscService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
