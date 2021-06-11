import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TokensSearchBarComponent } from './tokens-search-bar.component';

describe('TokensSearchBarComponent', () => {
  let component: TokensSearchBarComponent;
  let fixture: ComponentFixture<TokensSearchBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TokensSearchBarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TokensSearchBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
