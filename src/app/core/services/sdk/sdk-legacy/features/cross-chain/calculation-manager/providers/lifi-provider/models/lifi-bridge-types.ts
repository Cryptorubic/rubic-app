export const LIFI_API_CROSS_CHAIN_PROVIDERS = {
  ACROSS: 'across',
  ARBITRUM: 'arbitrum',
  CBRIDGE: 'cbridge',
  HOP: 'hop',
  HYPHEN: 'hyphen',
  STARGATE: 'stargate',
  ALLBRIDGE: 'allbridge',
  OMNI_BRIDGE: 'omni',
  CONNEXT_AMAROK: 'amarok',
  CIRCLE_CELER_BRIDGE: 'celercircle',
  CELERIM: 'celerim',
  OPTIMISM: 'optimism',
  SYMBIOSIS: 'symbiosis',
  LI_FUEL: 'lifuel',
  THOR_SWAP: 'thorswap'
} as const;

export type LifiSubProvider =
  (typeof LIFI_API_CROSS_CHAIN_PROVIDERS)[keyof typeof LIFI_API_CROSS_CHAIN_PROVIDERS];

export interface Bridge {
  key: LifiSubProvider;
  name: string;
  logoURI: string;
  bridgeUrl?: string;
  discordUrl?: string;
  supportUrl?: string;
  docsUrl?: string;
  explorerUrl?: string;
  analyticsUrl?: string;
}
