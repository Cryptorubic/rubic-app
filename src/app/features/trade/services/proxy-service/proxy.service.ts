import { Injectable } from '@angular/core';
import { PriceToken } from 'rubic-sdk';
import { SdkService } from '@core/services/sdk/sdk.service';
import { PlatformConfigurationService } from '@core/services/backend/platform-configuration/platform-configuration.service';
import { TokenType } from '@features/trade/services/proxy-service/models/token-type';
import { PercentTypes } from '@features/trade/services/proxy-service/models/percent-types';
import BigNumber from 'bignumber.js';
import {
  onChainFee,
  onChainFees,
  OnChainTierFeeType,
  OnChainTokenTypes
} from '@features/trade/services/proxy-service/models/on-chain-fee-model';
import { BlockchainStatus } from '@core/services/backend/platform-configuration/models/blockchain-status';
import { TokensStoreService } from '@core/services/tokens/tokens-store.service';
import { tokenTypeMapping } from '@features/trade/services/proxy-service/const/token-type-mapping';
import {
  crossChainFee,
  crossChainFees,
  CrossChainTierFeeType,
  CrossChainTokenTypes
} from '@features/trade/services/proxy-service/models/cross-chain-fee-model';

@Injectable({ providedIn: 'root' })
export class ProxyService {
  private readonly percentAddress: Record<PercentTypes, string> = {
    default: '0xB6c5B85Df916Ad05f08863dEC9ac06D92de2eC68',
    zeroFee: '0x51c276f1392E87D4De6203BdD80c83f5F62724d4',
    onePercent: '0xC095e57dDfa5924BC56bEAcf1D515F154ac44e94',
    twoPercent: '0xE20c7F79DAEaBEB7a9D8cEffB73c4f857Be7fC27'
  };

  // private readonly

  constructor(
    private readonly sdkService: SdkService,
    private readonly configService: PlatformConfigurationService,
    private readonly tokensStore: TokensStoreService
  ) {}

  public getIntegratorAddress(
    fromToken: PriceToken,
    fromAmount: BigNumber,
    toToken: PriceToken
  ): string {
    const isCrossChain = fromToken.blockchain !== toToken.blockchain;
    const fromPriceAmount = fromToken.price.multipliedBy(fromAmount);
    if (fromPriceAmount.lte(0)) {
      return this.percentAddress.default;
    }
    if (fromPriceAmount.lte(100)) {
      return this.percentAddress.zeroFee;
    }

    try {
      const availableBlockchains = this.configService.availableBlockchains;
      const fromBackendType = this.tokensStore.tokens.find(
        token => token.blockchain === fromToken.blockchain && token.address === fromToken.address
      ).type;
      const fromType = tokenTypeMapping[fromBackendType];

      const toBackendType = this.tokensStore.tokens.find(
        token => token.blockchain === toToken.blockchain && token.address === toToken.address
      ).type;
      const toType = tokenTypeMapping[toBackendType];

      if (isCrossChain) {
        const sourceTier = availableBlockchains.find(
          el => el.blockchain === fromToken.blockchain
        ).tier;
        const destTier = availableBlockchains.find(el => el.blockchain === toToken.blockchain).tier;
        return this.getCrossChainAddress(
          fromPriceAmount,
          fromType,
          toType,
          sourceTier,
          destTier,
          fromToken.symbol,
          toToken.symbol
        );
      } else {
        const chainTier = availableBlockchains.find(
          chain => chain.blockchain === fromToken.blockchain
        ).tier;
        return this.getOnChainAddress(fromPriceAmount, fromType, toType, chainTier);
      }
    } catch {
      return this.percentAddress.default;
    }
  }

  private getOnChainAddress(
    amount: BigNumber,
    fromType: TokenType,
    toType: TokenType,
    tier: BlockchainStatus['tier']
  ): string {
    const specificTokenType = `${fromType}_${toType}` as OnChainTokenTypes;
    const swapType = onChainFee[specificTokenType];
    const tierSwapType = `${swapType}_${tier}` as OnChainTierFeeType;
    const fee = onChainFees[tierSwapType];
    if (typeof fee === 'string') {
      return this.percentAddress[fee];
    }
    const sortedLimits = fee.sort((a, b) => b.limit - a.limit);
    const suitableLimit = sortedLimits.find(el => amount.gt(el.limit));
    const percentType = suitableLimit.type;
    return this.percentAddress[percentType];
  }

  private getCrossChainAddress(
    amount: BigNumber,
    fromType: TokenType,
    toType: TokenType,
    fromTier: BlockchainStatus['tier'],
    toTier: BlockchainStatus['tier'],
    fromSymbol: string,
    toSymbol: string
  ): string {
    const specificTokenType = `${fromType}_${toType}` as CrossChainTokenTypes;
    let swapType = crossChainFee[specificTokenType];
    if (swapType === 'tokenSwap' && fromSymbol === toSymbol) {
      swapType = 'sameTokenSwap';
    }
    const tierSwapType = `${swapType}_${fromTier}_${toTier}` as CrossChainTierFeeType;
    const fee = crossChainFees[tierSwapType];
    if (typeof fee === 'string') {
      return this.percentAddress[fee];
    }
    const sortedLimits = fee.sort((a, b) => b.limit - a.limit);
    const suitableLimit = sortedLimits.find(el => amount.gt(el.limit));
    const percentType = suitableLimit.type;
    return this.percentAddress[percentType];
  }
}
