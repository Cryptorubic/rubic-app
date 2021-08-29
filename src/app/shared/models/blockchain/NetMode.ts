export type NetMode = 'mainnet' | 'testnet';

export type ContractAddressesNetMode<SupportedBlockchain extends string> = {
  [mode in NetMode]: Record<SupportedBlockchain, string>;
};
