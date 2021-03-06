import { TokenInfoBody } from './types';
import { BLOCKCHAIN_NAMES } from '../../../pages/main-page/trades-form/types';

const ETH: TokenInfoBody = {
  name: 'Ethereum',
  symbol: 'ETH',
  decimals: 18,
  platform: BLOCKCHAIN_NAMES.ETHEREUM
};

// not added to coingecko_tokens
const BNB: TokenInfoBody = {
  name: 'Binance',
  symbol: 'BNB',
  decimals: 18,
  platform: BLOCKCHAIN_NAMES.BINANCE_SMART_CHAIN
};

// not added to coingecko_tokens
const MATIC: TokenInfoBody = {
  name: 'Matic',
  symbol: 'MATIC',
  decimals: 18,
  platform: BLOCKCHAIN_NAMES.MATIC
};

const nativeTokens = [ETH];

export { nativeTokens };
