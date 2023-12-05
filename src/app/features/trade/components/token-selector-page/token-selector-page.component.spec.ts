import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TokenSelectorPageComponent } from './token-selector-page.component';

describe('TokenSelectorPageComponent', () => {
  let component: TokenSelectorPageComponent;
  let fixture: ComponentFixture<TokenSelectorPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TokenSelectorPageComponent]
    });
    fixture = TestBed.createComponent(TokenSelectorPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
