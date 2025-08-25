import { CROSS_CHAIN_TRADE_TYPE, CrossChainTradeType, OnChainTradeType } from 'rubic-sdk';

export const CENTRALIZATION_STATUS = {
  CENTRALIZED: 'centralized',
  DECENTRALIZED: 'decentralized',
  SEMI_CENTRALIZED: 'semi-centralized'
} as const;

export type CentralizationStatus =
  (typeof CENTRALIZATION_STATUS)[keyof typeof CENTRALIZATION_STATUS];

export const CENTRALIZATION_CONFIG: Partial<Record<CrossChainTradeType, CentralizationStatus>> = {
  [CROSS_CHAIN_TRADE_TYPE.SIMPLE_SWAP]: CENTRALIZATION_STATUS.SEMI_CENTRALIZED,
  [CROSS_CHAIN_TRADE_TYPE.CHANGENOW]: CENTRALIZATION_STATUS.SEMI_CENTRALIZED,
  [CROSS_CHAIN_TRADE_TYPE.EXOLIX]: CENTRALIZATION_STATUS.SEMI_CENTRALIZED,
  [CROSS_CHAIN_TRADE_TYPE.CHANGELLY]: CENTRALIZATION_STATUS.SEMI_CENTRALIZED
};

export function hasCentralizationStatus(
  tradeType: CrossChainTradeType | OnChainTradeType
): tradeType is keyof typeof CENTRALIZATION_CONFIG {
  return Object.keys(CENTRALIZATION_CONFIG).some(type => type === tradeType);
}
