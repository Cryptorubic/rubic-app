import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { OrderBookTradeService } from '../../services/order-book-trade.service';

import { OrderBookTradeComponent } from './order-book-trade.component';

describe('OrderBookTradeComponent', () => {
  let component: OrderBookTradeComponent;
  let fixture: ComponentFixture<OrderBookTradeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        RouterTestingModule,
        HttpClientModule,
        MatDialogModule,
        BrowserAnimationsModule,
        SharedModule
      ],
      declarations: [OrderBookTradeComponent],
      providers: [OrderBookTradeService]
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
