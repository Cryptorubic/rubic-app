import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { TradeTypeService } from 'src/app/core/services/swaps/trade-type-service/trade-type.service';

import { OrderBooksTableComponent } from './order-books-table.component';
import { OrderBooksTableService } from './services/order-books-table.service';

describe('OrderBooksTableComponent', () => {
  let component: OrderBooksTableComponent;
  let fixture: ComponentFixture<OrderBooksTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientModule, TranslateModule.forRoot()],
      providers: [OrderBooksTableService, TradeTypeService],
      declarations: [OrderBooksTableComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderBooksTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
