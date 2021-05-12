import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import BigNumber from 'bignumber.js';
import { OrderBookDataToken } from 'src/app/features/order-book-trade-page/models/trade-data';
import { OrderBookTradeService } from 'src/app/features/order-book-trade-page/services/order-book-trade.service';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { BigNumberFormat } from 'src/app/shared/pipes/big-number-format.pipe';

import { TokenFormComponent } from './token-form.component';

describe('TokenFormComponent', () => {
  let component: TokenFormComponent;
  let fixture: ComponentFixture<TokenFormComponent>;
  const mockToken = {
    amountTotal: new BigNumber(1),
    amountContributed: new BigNumber(1),
    amountLeft: new BigNumber(1),
    investorsNumber: 1,
    isApproved: false,
    minContribution: new BigNumber(1),
    brokerPercent: 1,
    name: 'string',
    symbol: 'string',
    blockchain: BLOCKCHAIN_NAME.ETHEREUM_TESTNET,
    address: 'string',
    decimals: 20,
    image: 'string',
    rank: 1,
    price: 1
  } as OrderBookDataToken;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientModule, MatDialogModule],
      providers: [OrderBookTradeService],
      declarations: [TokenFormComponent, BigNumberFormat]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TokenFormComponent);
    component = fixture.componentInstance;
    component.tokenPart = 'from';
    component.tradeData = {
      token: {
        from: mockToken
      } as any
    } as any;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
