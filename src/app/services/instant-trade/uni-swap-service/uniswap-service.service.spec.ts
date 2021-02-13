import { TestBed } from '@angular/core/testing';

import { UniSwapService } from './uni-swap.service';
import BigNumber from 'bignumber.js';
import {InstantTradeToken} from '../types';
import {HttpClientTestingModule} from '@angular/common/http/testing';

describe('UniswapServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [HttpClientTestingModule],
  }));

  it('should be created', () => {
    const service: UniSwapService = TestBed.get(UniSwapService);
    const fromAmount = new BigNumber('100000000');
    const fromToken: InstantTradeToken = {
      network: 'ETH',
      address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
      decimals: 6,
      symbol: 'USDT'
    };
    const toToken: InstantTradeToken = {
      network: 'ETH',
      address: '0x6b175474e89094c44da98b954eedeac495271d0f',
      decimals: 18,
      symbol: 'DAI'
    };
    service.getTrade(fromAmount, fromToken, toToken).then(trade => {
      console.log(JSON.stringify(trade));
      expect(!!trade).toBeTruthy();
    });
  });
});
