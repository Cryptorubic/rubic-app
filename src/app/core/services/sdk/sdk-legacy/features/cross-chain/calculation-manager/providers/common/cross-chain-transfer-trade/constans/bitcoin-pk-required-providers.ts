import { CROSS_CHAIN_TRADE_TYPE } from '@cryptorubic/core';

export const BITCOIN_PK_REQUIRED_PROVIDERS = [
  CROSS_CHAIN_TRADE_TYPE.PACT_SWAP,
  CROSS_CHAIN_TRADE_TYPE.TELE_SWAP,
  CROSS_CHAIN_TRADE_TYPE.RELAY
] as const;

export type BtcTradeTypeRequiringPK = (typeof BITCOIN_PK_REQUIRED_PROVIDERS)[number];
