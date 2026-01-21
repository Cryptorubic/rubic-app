import { Injectable } from '@angular/core';
import { PlatformConfigurationService } from '@core/services/backend/platform-configuration/platform-configuration.service';
import BigNumber from 'bignumber.js';
import { BlockchainStatus } from '@core/services/backend/platform-configuration/models/blockchain-status';
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

import { tokenTypeMapping } from './const/token-type-mapping';
import { HttpService } from '@app/core/services/http/http.service';
import { firstValueFrom } from 'rxjs';
import { SessionStorageService } from '@app/core/services/session-storage/session-storage.service';
import { percentAddress } from './const/fee-type-address-mapping';
import { isWrapUnwrap } from '@app/shared/utils/is-wrap-unwrap';
import { BLOCKCHAIN_NAME, BlockchainsInfo, CHAIN_TYPE, PriceToken } from '@cryptorubic/core';
import { TokensFacadeService } from '@core/services/tokens/tokens-facade.service';

@Injectable({ providedIn: 'root' })
export class ProxyFeeService {
  constructor(
    private readonly configService: PlatformConfigurationService,
    private readonly httpService: HttpService,
    private readonly sessionStorage: SessionStorageService,
    private readonly tokensFacade: TokensFacadeService
  ) {}

  // eslint-disable-next-line complexity
  public async getIntegratorAddress(
    fromToken: PriceToken,
    fromAmount: BigNumber,
    toToken: PriceToken
  ): Promise<string> {
    try {
      // @TODO remove before release
      if (BlockchainsInfo.getChainType(fromToken.blockchain) === CHAIN_TYPE.EVM) {
        return this.handlePromoIntegrator(fromToken, toToken, percentAddress.twoPercent);
      }

      const referrer = this.sessionStorage.getItem('referrer');
      if (
        fromToken.blockchain === BLOCKCHAIN_NAME.SOLANA ||
        toToken.blockchain === BLOCKCHAIN_NAME.SOLANA
      ) {
        if (referrer) {
          const referralIntegrator = await this.getIntegratorByReferralName(referrer);

          if (referralIntegrator) return referralIntegrator;
        }
        return this.handlePromoIntegrator(fromToken, toToken, percentAddress.zeroFee);
      }
      const fromPriceAmount = fromToken.price.multipliedBy(fromAmount);

      if (isWrapUnwrap(fromToken, toToken)) {
        return percentAddress.zeroFee;
      }

      const isBeraSwap =
        (fromToken.blockchain === BLOCKCHAIN_NAME.BERACHAIN ||
          toToken.blockchain === BLOCKCHAIN_NAME.BERACHAIN) &&
        fromPriceAmount.isFinite();

      if ((fromPriceAmount.lte(0) || !fromPriceAmount.isFinite()) && !referrer) {
        return this.handlePromoIntegrator(fromToken, toToken, percentAddress.default);
      }
      if (fromPriceAmount.lte(100) && fromPriceAmount.isFinite()) {
        return this.handlePromoIntegrator(fromToken, toToken, percentAddress.zeroFee);
      }

      if (referrer) {
        const referralIntegrator = await this.getIntegratorByReferralName(referrer);

        if (referralIntegrator) return referralIntegrator;
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
        // BERA SWAP, REMOVE AFTER PROMO
        if (isBeraSwap && percentAddress[feeValue] !== percentAddress.zeroFee) {
          return this.handlePromoIntegrator(fromToken, toToken, percentAddress.onePercent);
        }
        return this.handlePromoIntegrator(fromToken, toToken, percentAddress[feeValue]);
      }

      const sortedLimits = feeValue.sort((a, b) => b.limit - a.limit);
      const suitableLimit = sortedLimits.find(el => fromPriceAmount.gt(el.limit));
      if (!suitableLimit) {
        throw new Error('Limit not found');
      }

      // BERA SWAP, REMOVE AFTER PROMO
      if (isBeraSwap && percentAddress[suitableLimit.type] !== percentAddress.zeroFee) {
        return this.handlePromoIntegrator(fromToken, toToken, percentAddress.onePercent);
      }

      return this.handlePromoIntegrator(fromToken, toToken, percentAddress[suitableLimit.type]);
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
    const token = this.tokensFacade.tokens.find(
      t => t.blockchain === soughtToken.blockchain && t.address === soughtToken.address
    );
    const backendType = token.type;

    return tokenTypeMapping[backendType];
  }

  // eslint-disable-next-line complexity
  private handlePromoIntegrator(from: PriceToken, to: PriceToken, providerAddress: string): string {
    const urlParams = new URLSearchParams(window.location.search);
    const commonIntegrator = urlParams.get('feeTarget') || urlParams.get('providerAddress');
    const crossChainIntegrator = urlParams.get('crossChainIntegratorAddress') || commonIntegrator;
    const onChainIntegrator = urlParams.get('onChainIntegratorAddress') || commonIntegrator;
    const isOnChain = from.blockchain === to.blockchain;

    if (onChainIntegrator && isOnChain) return onChainIntegrator;
    if (crossChainIntegrator && !isOnChain) return crossChainIntegrator;

    return providerAddress;
  }

  private async getIntegratorByReferralName(referral: string): Promise<string | null> {
    try {
      const integratorFromStorage = this.sessionStorage.getItem(referral.toLowerCase());

      if (integratorFromStorage) {
        return integratorFromStorage;
      }

      const res = await firstValueFrom(
        this.httpService.get<{ integrator_address?: string }>(
          `v2/referrers/get_integrator_address_for_referrer?referrer=${referral}`
        )
      );

      if (res.integrator_address) {
        this.sessionStorage.setItem(referral.toLowerCase(), res.integrator_address);

        return res.integrator_address;
      }

      return null;
    } catch {
      return null;
    }
  }
}
