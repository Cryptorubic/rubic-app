import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderBookTradeComponent } from './order-book-trade.component';

describe('OrderBookTradeComponent', () => {
  let component: OrderBookTradeComponent;
  let fixture: ComponentFixture<OrderBookTradeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OrderBookTradeComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderBookTradeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
