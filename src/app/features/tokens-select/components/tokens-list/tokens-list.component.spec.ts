import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TokensListComponent } from './tokens-list.component';

describe('TokensListComponent', () => {
  let component: TokensListComponent;
  let fixture: ComponentFixture<TokensListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TokensListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TokensListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
