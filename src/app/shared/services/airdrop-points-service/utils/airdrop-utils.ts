import {
  CrossChainRewardConvertedData,
  CrossChainRewardResponse,
  OnChainRewardConvertedData,
  OnChainRewardResponse,
  ProviderRewardData
} from '../models/airdrop-api-types';
import { CrossChainTradeType } from '@cryptorubic/sdk';
import {
  FROM_BACKEND_CROSS_CHAIN_PROVIDERS,
  FROM_BACKEND_ON_CHAIN_PROVIDERS,
  FromBackendOnChainProvider,
  ToBackendCrossChainProviders,
  ToBackendOnChainProvider
} from '@cryptorubic/core';

export class AirdropUtils {
  public static convertCrosschainRewardData(
    data: CrossChainRewardResponse
  ): CrossChainRewardConvertedData {
    const converted = {} as Record<CrossChainTradeType, ProviderRewardData>;

    Object.entries(data).forEach(
      ([providerNameOnBackend, rewardData]: [ToBackendCrossChainProviders, ProviderRewardData]) => {
        const providerNameOnClient = FROM_BACKEND_CROSS_CHAIN_PROVIDERS[
          providerNameOnBackend
        ] as CrossChainTradeType;
        converted[providerNameOnClient] = rewardData;
      }
    );

    return converted;
  }

  public static convertOnChainRewardData(data: OnChainRewardResponse): OnChainRewardConvertedData {
    const converted = {} as Record<FromBackendOnChainProvider, ProviderRewardData>;

    Object.entries(data).forEach(
      ([providerNameOnBackend, rewardData]: [ToBackendOnChainProvider, ProviderRewardData]) => {
        const providerNameOnClient = FROM_BACKEND_ON_CHAIN_PROVIDERS[
          providerNameOnBackend
        ] as FromBackendOnChainProvider;
        converted[providerNameOnClient] = rewardData;
      }
    );

    return converted;
  }
}
