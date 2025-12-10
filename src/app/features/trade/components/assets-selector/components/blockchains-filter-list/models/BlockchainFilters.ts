export const BlockchainTags = {
  POPULAR: 'Popular',
  PROMO: 'Promo',
  EVM: 'EVM',
  NON_EVM: 'Non-EVM',
  LAYER_2: 'Layer-2',
  ALL: 'All',
  PRIVATE: 'Privacy',
  NEW: 'new',
  BDAY_PROMO: 'birhtday'
} as const;
export const blockchainFilters = [
  BlockchainTags.ALL,
  BlockchainTags.PRIVATE,
  BlockchainTags.LAYER_2,
  BlockchainTags.EVM,
  BlockchainTags.NON_EVM
];
export type BlockchainTag = (typeof BlockchainTags)[keyof typeof BlockchainTags];
export type BlockchainFilters = Exclude<BlockchainTag, 'new'>;
