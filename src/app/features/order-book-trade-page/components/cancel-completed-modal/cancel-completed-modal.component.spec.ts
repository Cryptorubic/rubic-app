import { ComponentFixture, TestBed } from '@angular/core/testing';
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
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
