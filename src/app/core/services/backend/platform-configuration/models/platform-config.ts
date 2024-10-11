import { CrossChainProviderStatus } from '@core/services/backend/platform-configuration/models/cross-chain-provider-status';
import { BackendBlockchainStatus } from '@core/services/backend/platform-configuration/models/backend-blockchain-status';

export interface PlatformConfig {
  server_is_active: boolean;
  networks: {
    [chain: string]: BackendBlockchainStatus;
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
