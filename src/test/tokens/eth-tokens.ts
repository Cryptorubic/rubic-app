import {InstantTradeToken} from '../../app/services/instant-trade/types';

const WEENUS: InstantTradeToken = {
    network: 'KOVAN',
    address: '0xaff4481d10270f50f203e0763e2597776068cbc5',
    decimals: 18,
    symbol: 'WEENUS'
};

const YEENUS: InstantTradeToken = {
    network: 'KOVAN',
    address: '0xc6fde3fd2cc2b173aec24cc3f267cb3cd78a26b7',
    decimals: 6,
    symbol: 'YEENUS'
};

const USDT: InstantTradeToken = {
    network: 'KOVAN',
    address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
    decimals: 6,
    symbol: 'USDT'
};
const DAI: InstantTradeToken = {
    network: 'KOVAN',
    address: '0xC4375B7De8af5a38a93548eb8453a498222C4fF2',
    decimals: 18,
    symbol: 'DAI'
};

export {WEENUS, YEENUS, USDT, DAI};
