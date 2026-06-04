export const PRIVATE_MODE_TAB = {
  TRANSFER: 'Private Transfer',
  CROSS_CHAIN: 'Cross-Chain',
  ON_CHAIN: 'On-Chain'
} as const;

export type PrivateModeTab = (typeof PRIVATE_MODE_TAB)[keyof typeof PRIVATE_MODE_TAB];
