import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OperationInProgressModalComponent } from './operation-in-progress-modal.component';

describe('TradeInProggressComponent', () => {
  let component: OperationInProgressModalComponent;
  let fixture: ComponentFixture<OperationInProgressModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OperationInProgressModalComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OperationInProgressModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
