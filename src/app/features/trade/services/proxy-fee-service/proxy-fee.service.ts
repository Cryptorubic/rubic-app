import { Injectable } from '@angular/core';
import { PriceToken } from 'rubic-sdk';
import { SdkService } from '@core/services/sdk/sdk.service';
import { PlatformConfigurationService } from '@core/services/backend/platform-configuration/platform-configuration.service';
import BigNumber from 'bignumber.js';
import { BlockchainStatus } from '@core/services/backend/platform-configuration/models/blockchain-status';
import { TokensStoreService } from '@core/services/tokens/tokens-store.service';
import { percentAddress } from '@features/trade/services/proxy-fee-service/const/fee-type-address-mapping';
import { TokenType } from '@features/trade/services/proxy-fee-service/models/token-type';
import { FeeValue } from '@features/trade/services/proxy-fee-service/models/fee-value';
import {
  OnChainTierFeeType,
  OnChainTokenTypes
} from '@features/trade/services/proxy-fee-service/models/on-chain-fee-types';
import { onChainTokenTypeMapping } from '@features/trade/services/proxy-fee-service/const/on-chain-token-type-mapping';
import { onChainTokenTierMapping } from '@features/trade/services/proxy-fee-service/const/on-chain-token-tier-mapping';
import {
  CrossChainTierFeeType,
  CrossChainTokenType
} from '@features/trade/services/proxy-fee-service/models/cross-chain-fee-types';
import { crossChainTokenTypeMapping } from '@features/trade/services/proxy-fee-service/const/cross-chain-token-type-mapping';
import { crossChainTokenTierMapping } from '@features/trade/services/proxy-fee-service/const/cross-chain-token-tier-mapping';
import { tokenTypeMapping } from '@features/trade/services/proxy-fee-service/const/token-type-mapping';

@Injectable({ providedIn: 'root' })
export class ProxyFeeService {
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
    try {
      const fromPriceAmount = fromToken.price.multipliedBy(fromAmount);
      if (fromPriceAmount.lte(0)) {
        return percentAddress.default;
      }
      if (fromPriceAmount.lte(100)) {
        return percentAddress.zeroFee;
      }

      const fromType = this.getTokenType(fromToken);
      const toType = this.getTokenType(toToken);
      const feeValue = this.getFeeValue(fromToken, fromType, toToken, toType);

      if (typeof feeValue === 'string') {
        return percentAddress[feeValue];
      }
      const sortedLimits = feeValue.sort((a, b) => b.limit - a.limit);
      const suitableLimit = sortedLimits.find(el => fromPriceAmount.gt(el.limit));
      const percentType = suitableLimit.type;
      return percentAddress[percentType];
    } catch {
      return percentAddress.default;
    }
  }

  private getOnChainFee(
    fromType: TokenType,
    toType: TokenType,
    tier: BlockchainStatus['tier']
  ): FeeValue {
    const specificTokenType = `${fromType}_${toType}` as OnChainTokenTypes;
    const swapType = onChainTokenTypeMapping[specificTokenType];
    const tierSwapType = `${swapType}_${tier}` as OnChainTierFeeType;
    return onChainTokenTierMapping[tierSwapType];
  }

  private getCrossChainFee(
    fromType: TokenType,
    toType: TokenType,
    fromTier: BlockchainStatus['tier'],
    toTier: BlockchainStatus['tier'],
    fromSymbol: string,
    toSymbol: string
  ): FeeValue {
    const specificTokenType = `${fromType}_${toType}` as CrossChainTokenType;
    let swapType = crossChainTokenTypeMapping[specificTokenType];
    if (swapType === 'tokenSwap' && fromSymbol === toSymbol) {
      swapType = 'sameTokenSwap';
    }
    const tierSwapType = `${swapType}_${fromTier}_${toTier}` as CrossChainTierFeeType;
    return crossChainTokenTierMapping[tierSwapType];
  }

  private getFeeValue(
    fromToken: PriceToken,
    fromType: TokenType,
    toToken: PriceToken,
    toType: TokenType
  ): FeeValue {
    const availableBlockchains = this.configService.availableBlockchains;
    const isCrossChain = fromToken.blockchain !== toToken.blockchain;

    if (isCrossChain) {
      const sourceTier = availableBlockchains.find(
        el => el.blockchain === fromToken.blockchain
      ).tier;
      const destTier = availableBlockchains.find(el => el.blockchain === toToken.blockchain).tier;
      return this.getCrossChainFee(
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
      return this.getOnChainFee(fromType, toType, chainTier);
    }
  }

  private getTokenType(soughtToken: PriceToken): TokenType {
    const backendType = this.tokensStore.tokens.find(
      token => token.blockchain === soughtToken.blockchain && token.address === soughtToken.address
    ).type;
    return tokenTypeMapping[backendType];
  }
}
