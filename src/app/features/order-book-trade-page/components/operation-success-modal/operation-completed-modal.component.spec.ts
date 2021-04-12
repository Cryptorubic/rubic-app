import { ComponentFixture, TestBed } from '@angular/core/testing';
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
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
