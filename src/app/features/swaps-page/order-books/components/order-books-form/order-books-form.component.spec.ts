import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderBooksFormComponent } from './order-books-form.component';

describe('OrderBookFormComponent', () => {
  let component: OrderBooksFormComponent;
  let fixture: ComponentFixture<OrderBooksFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
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
