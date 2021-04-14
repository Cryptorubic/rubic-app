import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DepositButtonComponent } from './deposit-button.component';

describe('DepositButtonComponent', () => {
  let component: DepositButtonComponent;
  let fixture: ComponentFixture<DepositButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DepositButtonComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DepositButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
