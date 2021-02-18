import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TokensInputComponent } from './tokens-input.component';

describe('TokensInputComponent', () => {
  let component: TokensInputComponent;
  let fixture: ComponentFixture<TokensInputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TokensInputComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TokensInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
