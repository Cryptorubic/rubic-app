import { CrossChainProviderStatus } from '@core/services/backend/platform-configuration/models/cross-chain-provider-status';

export interface PlatformConfig {
  server_is_active: boolean;
  networks: {
    [chain: string]: boolean;
  };
  cross_chain_providers: {
    [provider: string]: CrossChainProviderStatus;
  };
  on_chain_providers: {
    proxy: {
      active: boolean;
    };
  };
}
