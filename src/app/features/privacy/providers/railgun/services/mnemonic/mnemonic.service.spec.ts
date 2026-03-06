import { TestBed } from '@angular/core/testing';

import { MnemonicService } from './mnemonic.service';

describe('MnemonicService', () => {
  let service: MnemonicService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MnemonicService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
