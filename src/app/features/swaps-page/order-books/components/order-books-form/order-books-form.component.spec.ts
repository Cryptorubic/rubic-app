import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { TradeParametersService } from 'src/app/core/services/swaps/trade-parameters-service/trade-parameters.service';
import { TradeTypeService } from 'src/app/core/services/swaps/trade-type-service/trade-type.service';

import { OrderBooksFormComponent } from './order-books-form.component';
import { OrderBooksFormService } from './services/order-books-form.service';

describe('OrderBookFormComponent', () => {
  let component: OrderBooksFormComponent;
  let fixture: ComponentFixture<OrderBooksFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [TradeTypeService, TradeParametersService, OrderBooksFormService],
      imports: [RouterTestingModule, HttpClientModule, MatDialogModule, TranslateModule.forRoot()],
      declarations: [OrderBooksFormComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderBooksFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
