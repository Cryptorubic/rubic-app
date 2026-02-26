import { TestBed } from '@angular/core/testing';

import { LevelDownService } from './level-down.service';

describe('LevelDownService', () => {
  let service: LevelDownService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LevelDownService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
