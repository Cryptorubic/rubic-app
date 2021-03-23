import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TokensTableComponent } from './tokens-table.component';

describe('TokensTableComponent', () => {
  let component: TokensTableComponent;
  let fixture: ComponentFixture<TokensTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TokensTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TokensTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
