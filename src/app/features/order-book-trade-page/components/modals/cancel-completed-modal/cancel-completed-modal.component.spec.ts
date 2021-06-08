import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { ScannerLinkPipe } from 'src/app/shared/pipes/scanner-link.pipe';

import { CancelCompletedModalComponent } from './cancel-completed-modal.component';

describe('CancelCompletedModalComponent', () => {
  let component: CancelCompletedModalComponent;
  let fixture: ComponentFixture<CancelCompletedModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CancelCompletedModalComponent, ScannerLinkPipe]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CancelCompletedModalComponent);
    component = fixture.componentInstance;
    component.blockchain = BLOCKCHAIN_NAME.ETHEREUM_TESTNET;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
