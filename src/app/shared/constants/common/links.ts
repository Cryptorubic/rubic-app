export enum ROUTE_PATH {
  NONE = '',
  LIMIT_ORDER = 'limit-order',
  HISTORY = 'history',
  BYT_CRYPTO = 'buy-crypto',
  ABOUT = 'about',
  CHANGENOW_RECENT_TRADES = 'changenow-recent-trades',
  /** @deprecated */
  PRIVACY = 'privacy',
  REWARDS = 'rewards',
  REST = '**'
}

export enum EXTERNAL_LINKS {
  LANDING = 'https://rubic.exchange',
  AIRDROP = 'https://claim.rubic.exchange',
  GO_PLUS_LABS = 'https://gopluslabs.io/token-security',
  TESTNET_APP = 'https://testnet.rubic.exchange/'
}

export enum INTERNAL_LINKS {
  TRANSFER = 'https://rubic.exchange'
}

export function getDefaultPrivacyURL(): string {
  return `${window.location.origin}?from=ETH&fromChain=ETH&to=USDT&toChain=ETH&amount=1&privateOnly=true`;
}
