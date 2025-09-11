import { FROM_BACKEND_CROSS_CHAIN_PROVIDERS } from '@app/core/services/backend/cross-chain-routing-api/constants/from-backend-cross-chain-providers';
import {
  CrossChainRewardConvertedData,
  CrossChainRewardResponse,
  OnChainRewardConvertedData,
  OnChainRewardResponse,
  ProviderRewardData
} from '../models/airdrop-api-types';
import { ToBackendCrossChainProviders } from '@app/core/services/backend/cross-chain-routing-api/constants/to-backend-cross-chain-providers';
import { CrossChainTradeType } from '@cryptorubic/sdk';
import {
  FROM_BACKEND_ON_CHAIN_PROVIDERS,
  FromBackendOnChainProvider,
  ToBackendOnChainProvider
} from '@app/features/trade/services/on-chain-api/constants/backend-providers';

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
