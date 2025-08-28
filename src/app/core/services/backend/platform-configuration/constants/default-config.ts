import { FROM_BACKEND_CROSS_CHAIN_PROVIDERS } from '@core/services/backend/cross-chain-routing-api/constants/from-backend-cross-chain-providers';
import { PlatformConfig } from '@core/services/backend/platform-configuration/models/platform-config';
import { FROM_BACKEND_BLOCKCHAINS } from '@cryptorubic/sdk';

export const defaultConfig: PlatformConfig = {
  server_is_active: true,
  networks: Object.fromEntries(
    Object.keys(FROM_BACKEND_BLOCKCHAINS).map(key => [
      key,
      {
        is_active: true,
        tier: 'TIER_TWO'
      }
    ])
  ),
  cross_chain_providers: Object.fromEntries(
    Object.keys(FROM_BACKEND_CROSS_CHAIN_PROVIDERS).map(key => [
      key,
      {
        active: true,
        disabledProviders: [],
        useProxy: true,
        average_execution_time: 30
      }
    ])
  ),
  on_chain_providers: {
    proxy: {
      active: true
    }
  }
};
