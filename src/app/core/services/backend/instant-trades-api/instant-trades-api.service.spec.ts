import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { InstantTradesApiService } from './instant-trades-api.service';

describe('InstantTradesApiService', () => {
  let service: InstantTradesApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule]
    });
    service = TestBed.inject(InstantTradesApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
