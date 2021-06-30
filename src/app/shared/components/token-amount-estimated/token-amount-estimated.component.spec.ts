import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AmountEstimatedComponent } from 'src/app/shared/components/token-amount-estimated/token-amount-estimated.component';

describe('AmountInputComponent', () => {
  let component: AmountEstimatedComponent;
  let fixture: ComponentFixture<AmountEstimatedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AmountEstimatedComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AmountEstimatedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
