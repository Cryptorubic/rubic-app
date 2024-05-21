export const BlockchainTags = {
  POPULAR: 'Popular',
  PROMO: 'Promo',
  EVM: 'EVM',
  NON_EVM: 'Non-EVM',
  LAYER_2: 'Layer-2',
  ALL: 'All',
  NEW: 'new'
} as const;
export const blockchainFilters = [
  BlockchainTags.POPULAR,
  BlockchainTags.PROMO,
  BlockchainTags.EVM,
  BlockchainTags.NON_EVM,
  BlockchainTags.LAYER_2,
  BlockchainTags.ALL
];
export type BlockchainTag = (typeof BlockchainTags)[keyof typeof BlockchainTags];
export type BlockchainFilters = Exclude<BlockchainTag, 'new'>;
