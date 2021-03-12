import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstantTradesComponent } from './instant-trades.component';

describe('InstantTradeComponent', () => {
  let component: InstantTradesComponent;
  let fixture: ComponentFixture<InstantTradesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InstantTradesComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InstantTradesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
