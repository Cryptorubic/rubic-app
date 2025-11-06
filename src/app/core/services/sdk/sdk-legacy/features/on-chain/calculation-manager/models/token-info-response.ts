import { BlockchainName } from '@cryptorubic/core';

export interface TokensResponseDto {
  /**
   * Amount of elements
   */
  count: number;

  /**
   * Link on next page request
   */
  next: string;

  /**
   * Link on prev page request
   */
  previous: string;

  /**
   * Tokens result
   */
  results: TokenBackDto[];
}

export interface TokenBackDto {
  /**
   * Token address
   */
  address: string;

  /**
   * Token name
   */
  name: string;

  /**
   * Token symbol
   */
  symbol: string;

  /**
   * Token network
   */
  blockchainNetwork: BlockchainName;

  /**
   * Token decimals
   */
  decimals: number;

  /**
   * Token image
   */
  image: string;

  /**
   * Token rank
   */
  rank: number;

  /**
   * Token type
   */
  type: 'TOKEN' | 'NATIVE' | 'NATIVE_ETH' | 'STABLE';

  /**
   * Used in iFrame or nor
   */
  usedInIframe: boolean;

  /**
   * Coingecko ID
   */
  coingeckoId: string;

  /**
   * Pricde in USD dollars
   */
  usdPrice: number;

  /**
   * Coingecko rank
   */
  coingecko_rank: number;

  /**
   * Token security data
   */
  token_security: TokenSecurityDto | null;
}

export interface TokenSecurityDto {
  has_info: boolean;

  trust_list: boolean;

  risky_security_items: number;

  attention_security_items: number;

  is_airdrop_scam: boolean;

  fake_token: boolean;

  buy_tax: string | null;

  sell_tax: string | null;
}
