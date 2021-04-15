import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { BigNumberFormat } from '../../pipes/big-number-format.pipe';

import { TokensInputComponent } from './tokens-input.component';

describe('TokensInputComponent', () => {
  let component: TokensInputComponent;
  let fixture: ComponentFixture<TokensInputComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [FormsModule, TranslateModule.forRoot()],
        declarations: [TokensInputComponent, BigNumberFormat]
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
