import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrderBookTableTokens } from 'src/app/features/swaps-page/order-books/models/trade-table';

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
    component.token = {
      from: { symbol: 'test' },
      to: { symbol: 'test' }
    } as OrderBookTableTokens;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
