import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BLOCKCHAIN_NAME } from '../../models/blockchain/BLOCKCHAIN_NAME';
import { ScannerLinkPipe } from '../../pipes/scanner-link.pipe';

import { ScannerLinkComponent } from './scanner-link.component';

describe('ScannerLinkComponent', () => {
  let component: ScannerLinkComponent;
  let fixture: ComponentFixture<ScannerLinkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ScannerLinkComponent, ScannerLinkPipe]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ScannerLinkComponent);
    component = fixture.componentInstance;
    component.blockchainName = BLOCKCHAIN_NAME.ETHEREUM_TESTNET;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
