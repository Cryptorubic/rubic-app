import {
  BLOCKCHAIN_NAME,
  BlockchainName,
  FROM_BACKEND_CROSS_CHAIN_PROVIDERS,
  FROM_BACKEND_ON_CHAIN_PROVIDERS,
  ToBackendCrossChainProviders,
  ToBackendOnChainProvider
} from '@cryptorubic/core';
import {
  PlatformConfigV3,
  PlatformConfigV3CcrProviderInfo,
  PlatformConfigV3ChainInfo,
  PlatformConfigV3OnchainProviderInfo
} from '../models/platform-config-v3';

export const defaultInfoV3Config: PlatformConfigV3 = {
  appIsActive: true,
  balanceNetworks: [],
  networks: Object.values(BLOCKCHAIN_NAME).reduce(
    (acc, chainName) => ({
      ...acc,
      [chainName]: {
        isActive: true,
        isActiveInApi: true,
        tier: 'TIER_ONE',
        proxyIsAvailable: true,
        proxyIsAvailableInApi: true,
        rank: 50
      }
    }),
    {} as Record<BlockchainName, PlatformConfigV3ChainInfo>
  ),
  crosschainProviders: Object.keys(FROM_BACKEND_CROSS_CHAIN_PROVIDERS).reduce(
    (acc, pythonProviderName) => ({
      ...acc,
      [pythonProviderName]: {
        basicStatusIsActive: true,
        useProxy: true,
        isForceDisabled: false,
        averageExecutionTime: 30,
        average: '300',
        median: '300',
        '95_percentile': 300,
        disabledProviders: [],
        betweenNetworksStats: {}
      } as PlatformConfigV3CcrProviderInfo
    }),
    {} as Record<ToBackendCrossChainProviders, PlatformConfigV3CcrProviderInfo>
  ),
  onchainProviders: Object.keys(FROM_BACKEND_ON_CHAIN_PROVIDERS).reduce(
    (acc, pythonProviderName) => ({
      ...acc,
      [pythonProviderName]: {
        basicStatusIsActive: true,
        useProxy: true,
        isForceDisabled: false
      }
    }),
    {} as Record<ToBackendOnChainProvider, PlatformConfigV3OnchainProviderInfo>
  )
};
