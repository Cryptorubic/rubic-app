export const PRIVATE_MODE_TAB = {
  TRANSFER: 'Stealth Send',
  CROSS_CHAIN: 'Cross-Chain',
  ON_CHAIN: 'On-Chain'
} as const;

export type PrivateModeTab = (typeof PRIVATE_MODE_TAB)[keyof typeof PRIVATE_MODE_TAB];
