import {
  BlockchainName,
  BlockchainsInfo,
  EvmBlockchainName,
  PriceToken,
  PriceTokenAmount,
  QuoteRequestInterface,
  Token
} from '@cryptorubic/core';
import { getPriceTokensFromInputTokens } from '../../common/utils/get-price-tokens-from-input-tokens';
import { defaultProviderAddresses } from '../../cross-chain/calculation-manager/constants/default-provider-addresses';
import { IsDeflationToken } from '../../common/models/is-deflation-token';
import { EvmWrapTrade } from './common/evm-wrap-trade/evm-wrap-trade';
import { OnChainProxyService } from './common/on-chain-proxy-service/on-chain-proxy-service';
import { EvmOnChainTrade } from './common/on-chain-trade/evm-on-chain-trade/evm-on-chain-trade';
import { OnChainManagerCalculationOptions } from './models/on-chain-manager-calculation-options';
import { ON_CHAIN_TRADE_TYPE } from './models/on-chain-trade-type';
import { RequiredOnChainManagerCalculationOptions } from './models/required-on-chain-manager-calculation-options';
import { WrappedOnChainTradeOrNull } from './models/wrapped-on-chain-trade-or-null';
import { TransformUtils } from '../../ws-api/transform-utils';
import { TokensResponseDto } from './models/token-info-response';
import { combineOptions, RubicSdkError } from '@cryptorubic/web3';
import { ProviderAddress } from '../../common/models/sdk-models/provider-address';
import { firstValueFrom } from 'rxjs';
import { SdkLegacyService } from '../../../sdk-legacy.service';

/**
 * Contains methods to calculate on-chain trades.
 */
export class OnChainManager {
  private static readonly defaultCalculationTimeout = 20_000;

  public constructor(
    private readonly providerAddress: ProviderAddress,
    private readonly sdkLegacyService: SdkLegacyService
  ) {}

  /**
   * Calculates on-chain trades, sorted by output amount.
   *
   * @example
   * ```ts
   * const blockchain = BLOCKCHAIN_NAME.ETHEREUM;
   * // ETH
   * const fromTokenAddress = '0x0000000000000000000000000000000000000000';
   * const fromAmount = 1;
   * // USDT
   * const toTokenAddress = '0xdac17f958d2ee523a2206206994597c13d831ec7';
   *
   * const trades = await sdk.onChainManager.calculateTrade(
   *     { blockchain, address: fromTokenAddress },
   *     fromAmount,
   *     toTokenAddress
   * );
   * const bestTrade = trades[0];
   *
   * trades.forEach(trade => {
   *     if (trade instanceof OnChainTrade) {
   *         console.log(trade.type, `to amount: ${trade.to.tokenAmount.toFormat(3)}`)
   *     }
   * })
   * ```
   *
   * @param fromToken Token to sell.
   * @param fromAmount Amount to sell.
   * @param toToken Token to get.
   * @param options Additional options.
   * @returns List of calculated on-chain trades.
   */
  public async calculateTrade(
    fromToken:
      | Token
      | {
          address: string;
          blockchain: BlockchainName;
        }
      | PriceToken,
    fromAmount: string | number,
    toToken: Token | string | PriceToken,
    options?: OnChainManagerCalculationOptions
  ): Promise<WrappedOnChainTradeOrNull[]> {
    if (toToken instanceof Token && fromToken.blockchain !== toToken.blockchain) {
      throw new RubicSdkError('Blockchains of from and to tokens must be same');
    }

    const { from, to } = await getPriceTokensFromInputTokens(
      fromToken,
      fromAmount.toString(),
      toToken,
      this.sdkLegacyService.tokenService
    );

    const fullOptions = await this.getFullOptions(from, to, options);
    if ((from.isNative && to.isWrapped) || (from.isWrapped && to.isNative)) {
      const trade = this.getWrappedWrapTrade(from, to);
      return [trade];
    }

    // @TODO API
    const request: QuoteRequestInterface = {
      srcTokenAddress: from.address,
      dstTokenBlockchain: to.blockchain,
      srcTokenBlockchain: from.blockchain,
      srcTokenAmount: from.stringWeiAmount,
      dstTokenAddress: to.address
    };
    const routes = await this.sdkLegacyService.rubicApiService.fetchRoutes(request);

    return Promise.all(
      routes.routes.map(route =>
        TransformUtils.transformOnChain(
          route,
          request,
          fullOptions.providerAddress,
          this.sdkLegacyService
        )
      )
    );
  }

  private async getFullOptions(
    from: PriceTokenAmount,
    to: PriceToken,
    options?: OnChainManagerCalculationOptions
  ): Promise<RequiredOnChainManagerCalculationOptions> {
    const chainType = BlockchainsInfo.getChainType(from.blockchain) as keyof ProviderAddress;

    const [isDeflationFrom, isDeflationTo] = await Promise.all([
      this.isDeflationToken(from),
      this.isDeflationToken(to)
    ]);
    let useProxy: boolean;
    if (options?.useProxy === false) {
      useProxy = options.useProxy;
    } else {
      useProxy =
        OnChainProxyService.isSupportedBlockchain(from.blockchain) &&
        (!isDeflationFrom.isDeflation || isDeflationFrom.isWhitelisted);
    }

    return combineOptions<RequiredOnChainManagerCalculationOptions>(
      { ...options, useProxy },
      {
        timeout: OnChainManager.defaultCalculationTimeout,
        disabledProviders: [],
        providerAddress:
          options?.providerAddress ||
          this.providerAddress?.[chainType]?.onChain ||
          defaultProviderAddresses.onChain,
        useProxy,
        withDeflation: {
          from: isDeflationFrom,
          to: isDeflationTo
        }
      }
    );
  }

  private async isDeflationToken(token: Token): Promise<IsDeflationToken> {
    const resp = await firstValueFrom(
      this.sdkLegacyService.httpClient.get<TokensResponseDto>(
        `https://api.rubic.exchange/api/v2/tokens/?address=${token.address}&network=${token.blockchain}`
      )
    );
    if (!resp.results.length) return { isDeflation: false };

    const foundToken = resp.results[0];
    const security = foundToken.token_security;
    if (!security) return { isDeflation: false };
    if (security.sell_tax || security.buy_tax) {
      return { isDeflation: true, isWhitelisted: security.trust_list };
    }

    return { isDeflation: false };
  }

  public static getWrapTrade(
    from: PriceTokenAmount,
    to: PriceToken,
    sdkLegacyService: SdkLegacyService
  ): EvmOnChainTrade {
    const fromToken = from as PriceTokenAmount<EvmBlockchainName>;
    const toToken = to as PriceToken<EvmBlockchainName>;
    return new EvmWrapTrade(
      {
        from: fromToken,
        to: new PriceTokenAmount<EvmBlockchainName>({
          ...toToken.asStructWithPrice,
          weiAmount: from.weiAmount
        }),
        slippageTolerance: 0,
        path: [],
        gasFeeInfo: null,
        useProxy: false,
        proxyFeeInfo: undefined,
        fromWithoutFee: fromToken,
        apiResponse: null,
        apiQuote: null,

        withDeflation: {
          from: { isDeflation: false },
          to: { isDeflation: false }
        }
      },
      sdkLegacyService
    );
  }

  private getWrappedWrapTrade(
    fromToken: PriceTokenAmount,
    toToken: PriceToken
  ): WrappedOnChainTradeOrNull {
    const wrappedTrade: WrappedOnChainTradeOrNull = {
      error: undefined,
      trade: null,
      tradeType: ON_CHAIN_TRADE_TYPE.WRAPPED
    };
    try {
      wrappedTrade.trade = OnChainManager.getWrapTrade(fromToken, toToken, this.sdkLegacyService);
    } catch (err: unknown) {
      wrappedTrade.error = err as RubicSdkError;
    }
    return wrappedTrade;
  }
}
