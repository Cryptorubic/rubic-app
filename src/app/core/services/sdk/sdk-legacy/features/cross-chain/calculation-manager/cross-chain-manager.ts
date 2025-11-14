import {
  BlockchainName,
  BlockchainsInfo,
  PriceToken,
  QuoteRequestInterface,
  Token
} from '@cryptorubic/core';
import BigNumber from 'bignumber.js';
import { getPriceTokensFromInputTokens } from '../../common/utils/get-price-tokens-from-input-tokens';
import { defaultCrossChainCalculationOptions } from './constants/default-cross-chain-calculation-options';
import { defaultProviderAddresses } from './constants/default-provider-addresses';
import {
  CrossChainManagerCalculationOptions,
  RequiredCrossChainManagerCalculationOptions
} from './models/cross-chain-manager-options';
import { WrappedCrossChainTrade } from './providers/common/models/wrapped-cross-chain-trade';
import { TransformUtils } from '../../ws-api/transform-utils';
import { ProviderAddress } from '../../common/models/sdk-models/provider-address';
import { combineOptions, RubicSdkError } from '@cryptorubic/web3';
import { SdkLegacyService } from '../../../sdk-legacy.service';
import { RubicApiService } from '../../../rubic-api/rubic-api.service';

/**
 * Contains method to calculate best cross-chain trade.
 */
export class CrossChainManager {
  constructor(
    private readonly providerAddress: ProviderAddress,
    private readonly sdkLegacyService: SdkLegacyService,
    private readonly rubicApiService: RubicApiService
  ) {}

  /**
   * Calculates cross-chain trades and sorts them by exchange courses.
   * Wrapped trade object may contain error, but sometimes course can be
   * calculated even with thrown error (e.g. min/max amount error).
   *
   * @example
   * ```ts
   * const fromBlockchain = BLOCKCHAIN_NAME.ETHEREUM;
   * // ETH
   * const fromTokenAddress = '0x0000000000000000000000000000000000000000';
   * const fromAmount = 1;
   * const toBlockchain = BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN;
   * // BUSD
   * const toTokenAddress = '0xe9e7cea3dedca5984780bafc599bd69add087d56';
   *
   * const wrappedTrades = await sdk.crossChainManager.calculateTrade(
   *     { blockchain: fromBlockchain, address: fromTokenAddress },
   *     fromAmount,
   *     { blockchain: toBlockchain, address: toTokenAddress }
   * );
   * const bestTrade = wrappedTrades[0];
   *
   * wrappedTrades.forEach(wrappedTrade => {
   *    if (wrappedTrade.trade) {
   *        console.log(wrappedTrade.tradeType, `to amount: ${wrappedTrade.trade.to.tokenAmount.toFormat(3)}`));
   *    }
   *    if (wrappedTrade.error) {
   *        console.error(wrappedTrade.tradeType, 'error: wrappedTrade.error');
   *    }
   * });
   *
   * ```
   *
   * @param fromToken Token to sell.
   * @param fromAmount Amount to sell.
   * @param toToken Token to get.
   * @param options Additional options.
   * @returns Array of sorted wrapped cross-chain trades with possible errors.
   */
  public async calculateTrade(
    fromToken:
      | Token
      | {
          address: string;
          blockchain: BlockchainName;
        }
      | PriceToken,
    fromAmount: string | number | BigNumber,
    toToken:
      | Token
      | {
          address: string;
          blockchain: BlockchainName;
        }
      | PriceToken,
    options?: CrossChainManagerCalculationOptions
  ): Promise<WrappedCrossChainTrade[]> {
    if (toToken instanceof Token && fromToken.blockchain === toToken.blockchain) {
      throw new RubicSdkError('Blockchains of `from` and `to` tokens must be different.');
    }

    const { from, to } = await getPriceTokensFromInputTokens(
      fromToken,
      fromAmount,
      toToken,
      this.sdkLegacyService.tokenService
    );
    const providerOptions = this.getFullOptions(from.blockchain, options);

    // @TODO API
    const request: QuoteRequestInterface = {
      srcTokenAddress: from.address,
      dstTokenBlockchain: to.blockchain,
      srcTokenBlockchain: from.blockchain,
      srcTokenAmount: from.stringWeiAmount,
      dstTokenAddress: to.address
    };
    const routes = await this.rubicApiService.fetchRoutes(request);

    return Promise.all(
      routes.routes.map(route =>
        TransformUtils.transformCrossChain(
          route,
          request,
          providerOptions.providerAddress,
          this.sdkLegacyService,
          this.rubicApiService
        )
      )
    );
  }

  private getFullOptions(
    fromBlockchain: BlockchainName,
    options?: CrossChainManagerCalculationOptions
  ): RequiredCrossChainManagerCalculationOptions {
    const providerAddress = options?.providerAddress
      ? options.providerAddress
      : this.getProviderAddress(fromBlockchain);

    return combineOptions(
      { ...options },
      {
        ...defaultCrossChainCalculationOptions,
        providerAddress
      }
    );
  }

  private getProviderAddress(fromBlockchain: BlockchainName): string {
    let chainType: keyof ProviderAddress | undefined;
    try {
      chainType = BlockchainsInfo.getChainType(fromBlockchain) as keyof ProviderAddress;
    } catch {
      /* empty */
    }

    let providerAddress = defaultProviderAddresses.crossChain;
    if (
      chainType &&
      this.providerAddress?.[chainType]?.crossChain &&
      this.providerAddress[chainType]!.crossChain !== undefined
    ) {
      providerAddress = this.providerAddress[chainType]!.crossChain!;
    }
    return providerAddress;
  }
}
