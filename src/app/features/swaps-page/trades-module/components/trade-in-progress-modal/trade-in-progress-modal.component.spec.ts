import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TradeInProgressModalComponent } from './trade-in-progress-modal.component';

describe('TradeInProgressModalComponent', () => {
  let component: TradeInProgressModalComponent;
  let fixture: ComponentFixture<TradeInProgressModalComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [TradeInProgressModalComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(TradeInProgressModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
