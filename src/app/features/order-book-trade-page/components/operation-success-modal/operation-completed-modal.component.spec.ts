import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { ScannerLinkPipe } from 'src/app/shared/pipes/scanner-link.pipe';

import { OperationCompletedModalComponent } from './operation-completed-modal.component';

describe('OperationSuccessComponent', () => {
  let component: OperationCompletedModalComponent;
  let fixture: ComponentFixture<OperationCompletedModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OperationCompletedModalComponent, ScannerLinkPipe]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OperationCompletedModalComponent);
    component = fixture.componentInstance;
    component.blockchain = BLOCKCHAIN_NAME.ETHEREUM_TESTNET;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
