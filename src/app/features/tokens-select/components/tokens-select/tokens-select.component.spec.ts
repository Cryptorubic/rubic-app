import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TokensSelectComponent } from './tokens-select.component';

describe('TokensSelectComponent', () => {
  let component: TokensSelectComponent;
  let fixture: ComponentFixture<TokensSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TokensSelectComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TokensSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
