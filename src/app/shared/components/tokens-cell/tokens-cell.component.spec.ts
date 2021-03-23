import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TokensCellComponent } from './tokens-cell.component';

describe('TokensCellComponent', () => {
  let component: TokensCellComponent;
  let fixture: ComponentFixture<TokensCellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TokensCellComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TokensCellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
