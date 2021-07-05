import { TestBed } from '@angular/core/testing';

import { CommonOneinchService } from './common-oneinch.service';

describe('CommonOneinchService', () => {
  let service: CommonOneinchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CommonOneinchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
