import { ComponentFixture, TestBed } from '@angular/core/testing';
import BigNumber from 'bignumber.js';
import {
  OrderBookTableToken,
  OrderBookTableTokens
} from 'src/app/features/swaps-page/order-books/models/trade-table';
import { BLOCKCHAIN_NAME } from '../../models/blockchain/BLOCKCHAIN_NAME';
import { BigNumberFormat } from '../../pipes/big-number-format.pipe';

import { VolumeCellComponent } from './volume-cell.component';

describe('VolumeCellComponent', () => {
  let component: VolumeCellComponent;
  let fixture: ComponentFixture<VolumeCellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VolumeCellComponent, BigNumberFormat]
    }).compileComponents();
  });

  beforeEach(() => {
    const orderBookTableToken = {
      address: '0x0000000000000000000000000000000000000000',
      amountContributed: new BigNumber(1),
      amountTotal: new BigNumber(1),
      blockchain: BLOCKCHAIN_NAME.ETHEREUM_TESTNET,
      brokerPercent: 0,
      decimals: 18,
      image: 'https://devswaps.mywish.io/media/token_images/cg_logo_eth_ethereum_uibu3ky.png',
      minContribution: new BigNumber(1),
      name: 'Ethereum',
      price: 1705,
      rank: 1,
      symbol: 'ETH'
    } as OrderBookTableToken;
    fixture = TestBed.createComponent(VolumeCellComponent);
    component = fixture.componentInstance;
    component.token = {
      from: orderBookTableToken,
      to: orderBookTableToken
    } as OrderBookTableTokens;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
