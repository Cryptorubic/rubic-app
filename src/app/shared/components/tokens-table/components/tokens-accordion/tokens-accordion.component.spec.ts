import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import BigNumber from 'bignumber.js';
import * as moment from 'moment';
import { ORDER_BOOK_TRADE_STATUS } from 'src/app/features/order-book-trade-page/models/trade-data';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { BigNumberFormat } from 'src/app/shared/pipes/big-number-format.pipe';

import { TokensAccordionComponent } from './tokens-accordion.component';

describe('TokensAccordionComponent', () => {
  let component: TokensAccordionComponent;
  let fixture: ComponentFixture<TokensAccordionComponent>;
  const mockToken = {
    amountTotal: new BigNumber(1),
    amountContributed: new BigNumber(1),
    amountLeft: new BigNumber(1),
    investorsNumber: 1,
    isApproved: 1,
    minContribution: new BigNumber(1),
    brokerPercent: 1
  };
  const mockData = {
    memo: 'string',
    contractAddress: 'string',
    uniqueLink: 'string',
    owner: 'string',

    token: {
      base: mockToken,
      quote: mockToken
    },
    blockchain: BLOCKCHAIN_NAME.ETHEREUM_TESTNET,
    status: ORDER_BOOK_TRADE_STATUS.ACTIVE,

    expirationDate: moment(new Date()),
    isPublic: 'boolean',
    isWithBrokerFee: false,
    brokerAddress: 'string',
    uniqieLink: 'test'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      declarations: [TokensAccordionComponent, BigNumberFormat]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TokensAccordionComponent);
    component = fixture.componentInstance;
    component.data = mockData as any;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
