export interface CrossChainProviderStatus {
  active: boolean;
  disabledProviders: string[];
  useProxy: boolean;
  average_execution_time: number;
}
