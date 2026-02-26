import { BLOCKCHAIN_NAME, TokenAmount } from '@cryptorubic/core';

export const SEPOLIA_TEST2_TOKEN = new TokenAmount({
  tokenAmount: '1',
  blockchain: BLOCKCHAIN_NAME.ETHEREUM,
  address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  name: 'USDT',
  symbol: 'USDT',
  decimals: 6
});
export const SEPOLIA_CTEST2_TOKEN = new TokenAmount({
  tokenAmount: '1',
  blockchain: BLOCKCHAIN_NAME.ETHEREUM,
  address: '0xAe0207C757Aa2B4019Ad96edD0092ddc63EF0c50',
  name: 'Confidential USDT',
  symbol: 'cUSDT',
  decimals: 6
});

export const TOKENS = [SEPOLIA_TEST2_TOKEN, SEPOLIA_CTEST2_TOKEN];
