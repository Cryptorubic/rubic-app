import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { BigNumberFormat } from 'src/app/shared/pipes/big-number-format.pipe';

import { TokensAccordionComponent } from './tokens-accordion.component';

describe('TokensAccordionComponent', () => {
  let component: TokensAccordionComponent;
  let fixture: ComponentFixture<TokensAccordionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      declarations: [TokensAccordionComponent, BigNumberFormat]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TokensAccordionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
