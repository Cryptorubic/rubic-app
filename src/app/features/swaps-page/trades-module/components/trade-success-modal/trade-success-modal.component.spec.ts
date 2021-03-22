import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TradeSuccessModalComponent } from './trade-success-modal.component';

describe('TradeSuccessModalComponent', () => {
  let component: TradeSuccessModalComponent;
  let fixture: ComponentFixture<TradeSuccessModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TradeSuccessModalComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TradeSuccessModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
