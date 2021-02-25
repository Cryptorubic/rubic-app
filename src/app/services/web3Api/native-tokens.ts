import { TokenInfoBody } from './types';

const ETH: TokenInfoBody = {
  name: 'Ethereum',
  symbol: 'ETH',
  decimals: 18,
  platform: 'ethereum'
};

// not added to coingecko_tokens
const BNB: TokenInfoBody = {
  name: 'Binance',
  symbol: 'BNB',
  decimals: 18,
  platform: 'binance'
};

// not added to coingecko_tokens
const MATIC: TokenInfoBody = {
  name: 'Matic',
  symbol: 'MATIC',
  decimals: 18,
  platform: 'matic'
};

const nativeTokens = [ETH];

export { nativeTokens };
