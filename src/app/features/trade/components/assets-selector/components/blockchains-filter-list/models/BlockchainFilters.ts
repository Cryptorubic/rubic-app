export enum BlockchainFilters {
  POPULAR = 'Popular',
  PROMO = 'Promo',
  EVM = 'EVM',
  NON_EVM = 'Non-EVM',
  LAYER_2 = 'Layer-2',
  ALL = '< All'
}

export type BlockchainFilter = (typeof BlockchainFilters)[keyof typeof BlockchainFilters];
