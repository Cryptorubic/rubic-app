export const PRIVATE_MODE_TAB = {
  ON_CHAIN: 'On-Chain',
  CROSS_CHAIN: 'Cross-Chain',
  TRANSFER: 'Transfer'
} as const;

export type PrivateModeTab = (typeof PRIVATE_MODE_TAB)[keyof typeof PRIVATE_MODE_TAB];
