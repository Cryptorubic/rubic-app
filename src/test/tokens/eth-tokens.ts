import { WETH as UniSwapWETH } from '@uniswap/sdk';
import InstantTradeToken from '../../app/features/swaps-page/instant-trades/models/InstantTradeToken';

const WEENUS: InstantTradeToken = {
  address: '0xaff4481d10270f50f203e0763e2597776068cbc5',
  decimals: 18,
  symbol: 'WEENUS'
};

const YEENUS: InstantTradeToken = {
  address: '0xc6fde3fd2cc2b173aec24cc3f267cb3cd78a26b7',
  decimals: 8,
  symbol: 'YEENUS'
};

const XEENUS: InstantTradeToken = {
  address: '0x022E292b44B5a146F2e8ee36Ff44D3dd863C915c',
  decimals: 18,
  symbol: 'XEENUS'
};

const ZEENUS: InstantTradeToken = {
  address: '0x1f9061B953bBa0E36BF50F21876132DcF276fC6e',
  decimals: 0,
  symbol: 'ZEENUS'
};

const ETH: InstantTradeToken = {
  address: '0x0000000000000000000000000000000000000000',
  decimals: 18,
  symbol: 'ETH'
};

const WETH: InstantTradeToken = {
  address: UniSwapWETH['42'].address,
  decimals: 18,
  symbol: 'WETH'
};

const WSATT: InstantTradeToken = {
  address: '0x93171f534715d36fAC7ED6b02A052671ee09Fc23',
  decimals: 18,
  symbol: 'WSATT'
};

export { WEENUS, YEENUS, XEENUS, ZEENUS, ETH, WETH, WSATT };
