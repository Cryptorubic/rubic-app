import { BLOCKCHAIN_NAME } from '@app/shared/models/blockchain/blockchain-name';

export const POOL_TOKENS = [
  {
    name: 'Rubic',
    symbol: 'BRBC',
    image: 'assets/images/icons/lp-providing/brbc.svg',
    address: '0xF3f3b70BF06082dD5b951009E7144b2D4Cb6972D',
    blockchain: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN
  },
  {
    name: 'USD coin',
    symbol: 'USDC',
    image: 'assets/images/icons/lp-providing/usdc.svg',
    address: '0xE782AFD525A5984124808bC0834DB25081b03dF3',
    blockchain: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN
  }
];
