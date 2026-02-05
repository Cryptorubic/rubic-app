import { BLOCKCHAIN_NAME, TokenAmount } from '@cryptorubic/core';

export const SEPOLIA_TEST2_TOKEN = new TokenAmount({
  tokenAmount: '1',
  blockchain: BLOCKCHAIN_NAME.SEPOLIA,
  address: '0xD616Bc7D4dbC05450dA7F7d3678e4047300bdc40',
  name: 'TEST2',
  symbol: 'TEST2',
  decimals: 18
});
export const SEPOLIA_CTEST2_TOKEN = new TokenAmount({
  tokenAmount: '1',
  blockchain: BLOCKCHAIN_NAME.SEPOLIA,
  address: '0x9942aBbEAb7f5BcefbA3d9865B148aA79B2E82eB',
  name: 'Confidential TEST2',
  symbol: 'cTEST2',
  decimals: 18
});

export const TOKENS = [SEPOLIA_TEST2_TOKEN, SEPOLIA_CTEST2_TOKEN];
