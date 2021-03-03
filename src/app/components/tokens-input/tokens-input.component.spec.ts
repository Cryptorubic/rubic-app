import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TokensInputComponent } from './tokens-input.component';

describe('TokensInputComponent', () => {
  let component: TokensInputComponent;
  let fixture: ComponentFixture<TokensInputComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [TokensInputComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(TokensInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
