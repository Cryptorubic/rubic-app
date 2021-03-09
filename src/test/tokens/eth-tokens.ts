import { WETH as UniSwapWETH } from '@uniswap/sdk';
import { InstantTradeToken } from '../../app/core/services/instant-trade/types';

const WEENUS: InstantTradeToken = {
  platform: 'KOVAN',
  address: '0xaff4481d10270f50f203e0763e2597776068cbc5',
  decimals: 18,
  symbol: 'WEENUS'
};

const YEENUS: InstantTradeToken = {
  platform: 'KOVAN',
  address: '0xc6fde3fd2cc2b173aec24cc3f267cb3cd78a26b7',
  decimals: 8,
  symbol: 'YEENUS'
};

const XEENUS: InstantTradeToken = {
  platform: 'KOVAN',
  address: '0x022E292b44B5a146F2e8ee36Ff44D3dd863C915c',
  decimals: 18,
  symbol: 'XEENUS'
};

const ZEENUS: InstantTradeToken = {
  platform: 'KOVAN',
  address: '0x1f9061B953bBa0E36BF50F21876132DcF276fC6e',
  decimals: 0,
  symbol: 'ZEENUS'
};

const ETH: InstantTradeToken = {
  platform: 'KOVAN',
  address: '0x0000000000000000000000000000000000000000',
  decimals: 18,
  symbol: 'ETH'
};

const WETH: InstantTradeToken = {
  platform: 'KOVAN',
  address: UniSwapWETH['42'].address,
  decimals: 18,
  symbol: 'WETH'
};

export { WEENUS, YEENUS, XEENUS, ZEENUS, ETH, WETH };
