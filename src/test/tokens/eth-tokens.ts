import {InstantTradeToken} from '../../app/services/instant-trade/types';
import {WETH as UniSwapWETH} from '@uniswap/sdk';

const WEENUS: InstantTradeToken = {
    network: 'KOVAN',
    address: '0xaff4481d10270f50f203e0763e2597776068cbc5',
    decimals: 18,
    symbol: 'WEENUS'
};

const YEENUS: InstantTradeToken = {
    network: 'KOVAN',
    address: '0xc6fde3fd2cc2b173aec24cc3f267cb3cd78a26b7',
    decimals: 8,
    symbol: 'YEENUS'
};

const ETH: InstantTradeToken = {
    network: 'KOVAN',
    address: '0x0000000000000000000000000000000000000000',
    decimals: 18,
    symbol: 'ETH'
};

const WETH: InstantTradeToken = {
    network: 'KOVAN',
    address: UniSwapWETH['42'].address,
    decimals: 18,
    symbol: 'WETH'
};

export {WEENUS, YEENUS, ETH, WETH};
