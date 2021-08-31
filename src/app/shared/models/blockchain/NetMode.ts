export type NetMode = 'mainnet' | 'testnet';

export type ContractAddressNetMode = {
  [mode in NetMode]: string;
};

export type ContractAddressesNetMode<SupportedBlockchain extends string> = {
  [mode in NetMode]: Record<SupportedBlockchain, string>;
};
