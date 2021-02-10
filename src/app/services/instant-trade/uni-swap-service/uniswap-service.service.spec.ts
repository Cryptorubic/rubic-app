import { TestBed } from '@angular/core/testing';

import { UniSwapServiceService } from './uni-swap-service.service';
import BigNumber from 'bignumber.js';
import {InstantTradeToken} from '../types';

describe('UniswapServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: UniSwapServiceService = TestBed.get(UniSwapServiceService);
    expect(service).toBeTruthy();
    const fromAmount = new BigNumber(100);
    const fromToken: InstantTradeToken = {
      network: 'ETH',
      address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
      decimals: 6,
      symbol: 'USDT'
    };
    const toToken: InstantTradeToken = {
      network: 'ETH',
      address: '0xa4eed63db85311e22df4473f87ccfc3dadcfa3e3',
      decimals: 6,
      symbol: 'RBC'
    };
    service.getTrade(fromAmount, fromToken, toToken);
  });
});
