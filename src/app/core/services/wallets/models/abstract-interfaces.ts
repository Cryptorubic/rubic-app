export interface SupportsManyChains<ChainParams> {
  switchChain: (chainId: string) => Promise<void | never>;
  addChain: (params: ChainParams) => Promise<void | never>;
}
