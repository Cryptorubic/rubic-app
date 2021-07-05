import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TokensListElementComponent } from './tokens-list-element.component';

describe('TokensListElementComponent', () => {
  let component: TokensListElementComponent;
  let fixture: ComponentFixture<TokensListElementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TokensListElementComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TokensListElementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
