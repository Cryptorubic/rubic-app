import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderBooksTableComponent } from './order-books-table.component';

describe('OrderBooksTableComponent', () => {
  let component: OrderBooksTableComponent;
  let fixture: ComponentFixture<OrderBooksTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
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
