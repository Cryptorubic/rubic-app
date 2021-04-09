import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TokensAccordionComponent } from './tokens-accordion.component';

describe('TokensAccordionComponent', () => {
  let component: TokensAccordionComponent;
  let fixture: ComponentFixture<TokensAccordionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TokensAccordionComponent]
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
