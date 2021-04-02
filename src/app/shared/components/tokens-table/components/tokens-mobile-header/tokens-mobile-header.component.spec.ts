import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TokensMobileHeaderComponent } from './tokens-mobile-header.component';

describe('SortingDropdownComponent', () => {
  let component: TokensMobileHeaderComponent;
  let fixture: ComponentFixture<TokensMobileHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TokensMobileHeaderComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TokensMobileHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
