import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderBookAdvancedOptionsComponent } from './order-book-advanced-options.component';

describe('OrderBookAdvancedOptionsComponent', () => {
  let component: OrderBookAdvancedOptionsComponent;
  let fixture: ComponentFixture<OrderBookAdvancedOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OrderBookAdvancedOptionsComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderBookAdvancedOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
