import { TestBed } from '@angular/core/testing';

import { IframeService } from './iframe.service';

describe('IframeService', () => {
  let service: IframeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IframeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
