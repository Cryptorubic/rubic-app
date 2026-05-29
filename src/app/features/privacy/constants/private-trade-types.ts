export const PRIVATE_TRADE_TYPE = {
  ZAMA: 'ZAMA',
  HINKAL: 'HINKAL',
  PRIVACY_CASH: 'PRIVACY_CASH',
  RAILGUN: 'RAILGUN',
  CLEARSWAP: 'CLEARSWAP',
  HOUDINI: 'HOUDINI'
} as const;

export type PrivateTradeType = (typeof PRIVATE_TRADE_TYPE)[keyof typeof PRIVATE_TRADE_TYPE];
