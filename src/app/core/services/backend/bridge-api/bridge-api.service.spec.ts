import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { BridgeApiService } from './bridge-api.service';

describe('BackendApiService', () => {
  let service: BridgeApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
      providers: [BridgeApiService]
    });
    service = TestBed.inject(BridgeApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
