import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionStateComponent } from './transaction-state.component';

describe('TransactionStateComponent', () => {
  let component: TransactionStateComponent;
  let fixture: ComponentFixture<TransactionStateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TransactionStateComponent]
    });
    fixture = TestBed.createComponent(TransactionStateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
