import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceiveButtonComponent } from './receive-button.component';

describe('DepositButtonComponent', () => {
  let component: ReceiveButtonComponent;
  let fixture: ComponentFixture<ReceiveButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReceiveButtonComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReceiveButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
