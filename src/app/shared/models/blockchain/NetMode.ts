export type NetMode = 'mainnet' | 'testnet';

export type ContractAddresses<SupportedBlockchain extends string> = {
  [mode in NetMode]: Record<SupportedBlockchain, string>;
};
