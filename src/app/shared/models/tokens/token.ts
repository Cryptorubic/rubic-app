import { BlockchainToken } from '@shared/models/tokens/blockchain-token';
import { TokenSecurity } from '@shared/models/tokens/token-security';

export interface Token extends BlockchainToken {
  image: string;
  rank: number;
  price: number;
  networkRank?: number;

  /**
   * Security information about token.
   * Equals `null` in case security information is not available.
   */
  tokenSecurity?: TokenSecurity | null;

  type?: 'NATIVE' | 'STABLE' | 'WRAPPED_NATIVE' | 'NATIVE_ETH' | 'TOKEN' | 'BRIDGED_NATIVE';
}

export interface RatedToken extends Token {
  sourceRank: number;
  priceChange24h: number;
  priceChange7d: number;
}
