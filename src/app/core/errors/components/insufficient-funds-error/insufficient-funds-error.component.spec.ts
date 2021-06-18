import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InsufficientFundsErrorComponent } from './insufficient-funds-error.component';

describe('InsufficientFundsErrorComponent', () => {
  let component: InsufficientFundsErrorComponent;
  let fixture: ComponentFixture<InsufficientFundsErrorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InsufficientFundsErrorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InsufficientFundsErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
