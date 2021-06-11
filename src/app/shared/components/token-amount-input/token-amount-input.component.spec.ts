import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TokenAmountInputComponent } from './token-amount-input.component';

describe('TokenAmountInputComponent', () => {
  let component: TokenAmountInputComponent;
  let fixture: ComponentFixture<TokenAmountInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TokenAmountInputComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TokenAmountInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
