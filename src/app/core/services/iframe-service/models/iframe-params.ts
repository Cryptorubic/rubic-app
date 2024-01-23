export interface IframeParams {
  iframe: boolean;
  device?: 'desktop' | 'mobile';
  providerAddress?: string;
  tokenSearch?: boolean;

  crossChainIntegratorAddress?: string;
  onChainIntegratorAddress?: string;
}
