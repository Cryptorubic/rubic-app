import { NetworkName } from '@railgun-community/shared-models';

export type PrivacySupportedNetworks =
  | NetworkName.Ethereum
  | NetworkName.BNBChain
  | NetworkName.Polygon
  | NetworkName.Arbitrum;
