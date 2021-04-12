import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { OrderBookTradeService } from '../../services/order-book-trade.service';

import { OrderBookTradeComponent } from './order-book-trade.component';

describe('OrderBookTradeComponent', () => {
  let component: OrderBookTradeComponent;
  let fixture: ComponentFixture<OrderBookTradeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [OrderBookTradeService],
      imports: [RouterTestingModule, HttpClientModule, MatDialogModule],
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
