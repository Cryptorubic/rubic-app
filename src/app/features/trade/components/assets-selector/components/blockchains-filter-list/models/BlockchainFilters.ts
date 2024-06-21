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
  BlockchainTags.ALL,
  BlockchainTags.POPULAR,
  BlockchainTags.PROMO,
  BlockchainTags.LAYER_2,
  BlockchainTags.EVM,
  BlockchainTags.NON_EVM
];
export type BlockchainTag = (typeof BlockchainTags)[keyof typeof BlockchainTags];
export type BlockchainFilters = Exclude<BlockchainTag, 'new'>;
