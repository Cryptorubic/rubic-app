import { TestBed } from '@angular/core/testing';

import { HeaderStore } from './header.store';

describe('HeaderService', () => {
  let service: HeaderStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HeaderStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
