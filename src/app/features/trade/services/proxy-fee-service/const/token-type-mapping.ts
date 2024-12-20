import { Token } from '@shared/models/tokens/token';
import { TokenType } from '@features/trade/services/proxy-fee-service/models/token-type';

export const tokenTypeMapping: Record<Token['type'], TokenType> = {
  STABLE: 'stable',
  WRAPPED_NATIVE: 'wNative',
  NATIVE: 'native',
  NATIVE_ETH: 'native_eth',
  TOKEN: 'token',
  BRIDGED_NATIVE: 'bridged_native',
  BRIDGED_BTC: 'bridged_btc'
};
