import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TokensSwapInputComponent } from './tokens-swap-input.component';

describe('TokensSwapInputComponent', () => {
  let component: TokensSwapInputComponent;
  let fixture: ComponentFixture<TokensSwapInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TokensSwapInputComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TokensSwapInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
