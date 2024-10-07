import { Injectable } from '@angular/core';
import { BLOCKCHAIN_NAME, BlockchainName, PriceToken } from 'rubic-sdk';
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
import {
  MERLIN_INTEGRATOR_ADDRESS,
  RUBIC_BDAY_ADDRESS,
  TAIKO_INTEGRATOR_ADDRESS_CROSS_CHAIN,
  TAIKO_INTEGRATOR_ADDRESS_ON_CHAIN,
  XLAYER_INTEGRATOR_ADDRESS_CROSS_CHAIN,
  XLAYER_INTEGRATOR_ADDRESS_ON_CHAIN
} from './const/integrators-addresses';
import { tokenTypeMapping } from './const/token-type-mapping';

@Injectable({ providedIn: 'root' })
export class ProxyFeeService {
  constructor(
    private readonly configService: PlatformConfigurationService,
    private readonly tokensStore: TokensStoreService
  ) {}

  public async getIntegratorAddress(
    fromToken: PriceToken,
    fromAmount: BigNumber,
    toToken: PriceToken
  ): Promise<string> {
    try {
      const fromPriceAmount = fromToken.price.multipliedBy(fromAmount);
      if (fromPriceAmount.lte(0) || !fromPriceAmount.isFinite()) {
        return percentAddress.default;
      }
      if (fromPriceAmount.lte(100)) {
        return percentAddress.zeroFee;
      }

      const fromType = this.getTokenType(fromToken);
      if (!fromType) {
        throw new Error('Failed to fetch token from backend');
      }
      const toType = this.getTokenType(toToken);
      if (!toType) {
        throw new Error('Failed to fetch token from backend');
      }
      const feeValue = this.getFeeValue(fromToken, fromType, toToken, toType);

      if (typeof feeValue === 'string') {
        return this.handleIntegratorAddress(
          fromToken.blockchain,
          toToken.blockchain,
          percentAddress[feeValue]
        );
      }

      const sortedLimits = feeValue.sort((a, b) => b.limit - a.limit);
      const suitableLimit = sortedLimits.find(el => fromPriceAmount.gt(el.limit));
      if (!suitableLimit) {
        throw new Error('Limit not found');
      }

      return this.handleIntegratorAddress(
        fromToken.blockchain,
        toToken.blockchain,
        percentAddress[suitableLimit.type]
      );
    } catch (err) {
      console.error(err);
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
    const token = this.tokensStore.tokens.find(
      t => t.blockchain === soughtToken.blockchain && t.address === soughtToken.address
    );
    const backendType = token.type;

    return tokenTypeMapping[backendType];
  }

  // eslint-disable-next-line complexity
  private handleIntegratorAddress(
    fromBlockchain: BlockchainName,
    toBlockchain: BlockchainName,
    providerAddress: string
  ): string {
    const urlParams = new URLSearchParams(window.location.search);
    const commonIntegrator = urlParams.get('feeTarget') || urlParams.get('providerAddress');
    const crossChainIntegrator = urlParams.get('crossChainIntegratorAddress') || commonIntegrator;
    const onChainIntegrator = urlParams.get('onChainIntegratorAddress') || commonIntegrator;
    const isOnChain = fromBlockchain === toBlockchain;

    if (onChainIntegrator && isOnChain) return onChainIntegrator;
    if (crossChainIntegrator && !isOnChain) return crossChainIntegrator;

    const useTaikoIntegratorOnChain =
      fromBlockchain === toBlockchain && fromBlockchain === BLOCKCHAIN_NAME.TAIKO;
    const useTaikoIntegratorCcr =
      fromBlockchain === BLOCKCHAIN_NAME.TAIKO || toBlockchain === BLOCKCHAIN_NAME.TAIKO;
    const useMerlinIntegrator =
      fromBlockchain === BLOCKCHAIN_NAME.MERLIN || toBlockchain === BLOCKCHAIN_NAME.MERLIN;
    const useXLayerIntegratorOnChain =
      fromBlockchain === toBlockchain && fromBlockchain === BLOCKCHAIN_NAME.XLAYER;
    const useXLayerIntegratorCcr =
      fromBlockchain === BLOCKCHAIN_NAME.XLAYER || toBlockchain === BLOCKCHAIN_NAME.XLAYER;
    const useRubicBdayIntegrator =
      fromBlockchain === BLOCKCHAIN_NAME.SCROLL || toBlockchain === BLOCKCHAIN_NAME.SCROLL;

    if (useTaikoIntegratorOnChain) return TAIKO_INTEGRATOR_ADDRESS_ON_CHAIN;
    if (useTaikoIntegratorCcr) return TAIKO_INTEGRATOR_ADDRESS_CROSS_CHAIN;
    if (useMerlinIntegrator) return MERLIN_INTEGRATOR_ADDRESS;
    if (useXLayerIntegratorOnChain) return XLAYER_INTEGRATOR_ADDRESS_ON_CHAIN;
    if (useXLayerIntegratorCcr) return XLAYER_INTEGRATOR_ADDRESS_CROSS_CHAIN;
    if (useRubicBdayIntegrator) return RUBIC_BDAY_ADDRESS;

    return providerAddress;
  }
}
