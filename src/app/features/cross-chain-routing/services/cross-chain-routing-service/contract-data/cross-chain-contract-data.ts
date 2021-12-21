import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/BLOCKCHAIN_NAME';
import {
  MinimalProvider,
  ProviderData
} from '@features/cross-chain-routing/services/cross-chain-routing-service/models/ProviderData';
import { CROSS_CHAIN_SWAP_METHOD } from '@features/cross-chain-routing/services/cross-chain-routing-service/models/CROSS_CHAIN_SWAP_METHOD';
import { UniSwapV3Service } from '@features/instant-trade/services/instant-trade-service/providers/ethereum/uni-swap-v3-service/uni-swap-v3.service';
import { crossChainSwapContractAddresses } from '@features/cross-chain-routing/services/cross-chain-routing-service/constants/crossChainSwapContract/crossChainSwapContractAddresses';
import { SupportedCrossChainSwapBlockchain } from '@features/cross-chain-routing/services/cross-chain-routing-service/models/SupportedCrossChainSwapBlockchain';
import InstantTradeToken from '@features/instant-trade/models/InstantTradeToken';
import { transitTokens } from '@features/cross-chain-routing/services/cross-chain-routing-service/constants/transit-tokens';

export class CrossChainContractData {
  public get address(): string {
    return crossChainSwapContractAddresses[this.blockchain];
  }

  public get transitToken(): InstantTradeToken {
    return transitTokens[this.blockchain];
  }

  constructor(
    public readonly blockchain: SupportedCrossChainSwapBlockchain,
    public readonly providersData: ProviderData[],
    public readonly numOfBlockchain: number
  ) {}

  public getProvider(providerIndex: number): MinimalProvider {
    return this.providersData[providerIndex].provider;
  }

  public getMethodName(providerIndex: number, isNativeToken: boolean): string {
    let defaultMethodName: string = isNativeToken
      ? CROSS_CHAIN_SWAP_METHOD.SWAP_CRYPTO
      : CROSS_CHAIN_SWAP_METHOD.SWAP_TOKENS;

    if (this.blockchain === BLOCKCHAIN_NAME.AVALANCHE) {
      defaultMethodName += 'AVAX';
    }

    if (this.getProvider(providerIndex) instanceof UniSwapV3Service) {
      defaultMethodName += 'V3';
    }

    return defaultMethodName + this.providersData[providerIndex].methodSuffix;
  }
}
