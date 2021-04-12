import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TradeParametersService } from 'src/app/core/services/swaps/trade-parameters-service/trade-parameters.service';
import { TradeTypeService } from 'src/app/core/services/swaps/trade-type-service/trade-type.service';

import { OrderBooksFormComponent } from './order-books-form.component';

describe('OrderBookFormComponent', () => {
  let component: OrderBooksFormComponent;
  let fixture: ComponentFixture<OrderBooksFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [TradeTypeService, TradeParametersService],
      imports: [RouterTestingModule, HttpClientModule],
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
