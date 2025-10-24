import { ToBackendOnChainProvider } from '@app/features/trade/services/on-chain-api/constants/backend-providers';
import { BlockchainName, ToBackendCrossChainProviders } from '@cryptorubic/core';

export interface PlatformConfigV3 {
  appIsActive: boolean;
  networks: {
    [key in BlockchainName]: PlatformConfigV3ChainInfo;
  };
  crosschainProviders: {
    [key in ToBackendCrossChainProviders]: PlatformConfigV3CcrProviderInfo;
  };
  onchainProviders: {
    [key in ToBackendOnChainProvider]: PlatformConfigV3OnchainProviderInfo;
  };
}

export interface PlatformConfigV3ChainInfo {
  isActive: boolean;
  isActiveInApi: boolean;
  tier: string;
  proxyIsAvailable: boolean;
  proxyIsAvailableInApi: boolean;
  rank: number;
}

export interface PlatformConfigV3CcrProviderInfo {
  basicStatusIsActive: boolean;
  useProxy: boolean;
  isForceDisabled: boolean;
  /**
   * time in minutes 30
   */
  averageExecutionTime: number;
  /**
   * time in secs "265.56"
   */
  average?: string;
  /**
   * time in secs "161.00"
   */
  median?: string;
  /**
   * time in secs 1091.8
   */
  '95_percentile'?: number;
  disabledProviders: string[];
  betweenNetworksStats: {
    [key: string]: {
      average: string;
      median: string;
      '95_percentile': number;
    };
  };
}

export interface PlatformConfigV3OnchainProviderInfo {
  basicStatusIsActive: boolean;
  useProxy: boolean;
  isForceDisabled: boolean;
}
