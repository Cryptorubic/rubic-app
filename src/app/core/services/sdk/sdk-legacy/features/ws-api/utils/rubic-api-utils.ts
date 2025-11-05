import {
  blockchainId,
  BlockchainName,
  BlockchainsInfo,
  CHAIN_TYPE,
  CrossChainTradeType,
  nativeTokensList,
  PriceTokenAmount,
  QuoteRequestInterface,
  QuoteResponseInterface,
  TokenInerface
} from '@cryptorubic/core';
import { Address } from '@ton/core';
import BigNumber from 'bignumber.js';
import { RubicStep } from '../../cross-chain/calculation-manager/providers/common/models/rubicStep';

import { ApiCrossChainConstructor } from '../models/api-cross-chain-constructor';
import { ApiOnChainConstructor } from '../models/api-on-chain-constructor';
import { RubicApiParser } from './rubic-api-parser';
import { Web3Pure } from '@cryptorubic/web3';

export class RubicApiUtils {
  public static getTradeParams(
    quote: QuoteRequestInterface,
    response: QuoteResponseInterface,
    providerType: string
  ): Promise<ApiCrossChainConstructor<BlockchainName>> {
    const isFailedResponse = !response;

    return isFailedResponse
      ? RubicApiUtils.getEmptyTradeParams(quote, providerType)
      : RubicApiUtils.getFullTradeParams(quote, response);
  }

  private static async getEmptyTradeParams(
    quote: QuoteRequestInterface,
    providerType: string
  ): Promise<ApiCrossChainConstructor<BlockchainName>> {
    const [fromToken, toToken] = await Promise.all([
      PriceTokenAmount.createToken({
        address: quote.srcTokenAddress,
        blockchain: quote.srcTokenBlockchain,
        tokenAmount: new BigNumber(quote.srcTokenAmount)
      }),
      PriceTokenAmount.createToken({
        address: quote.dstTokenAddress,
        blockchain: quote.dstTokenBlockchain,
        tokenAmount: new BigNumber(0)
      })
    ]);

    const swapType = fromToken.blockchain === toToken.blockchain ? 'on-chain' : 'cross-chain';
    const routePath: RubicStep[] = [
      {
        path: [fromToken, toToken],
        provider: providerType,
        type: swapType
      }
    ];

    const tradeParams: ApiCrossChainConstructor<BlockchainName> = {
      from: fromToken,
      to: toToken,
      apiQuote: quote,
      routePath,
      feeInfo: {},
      apiResponse: this.getEmptyResponse(fromToken, toToken, providerType)
    };

    return tradeParams;
  }

  private static async getFullTradeParams(
    quote: QuoteRequestInterface,
    response: QuoteResponseInterface
  ): Promise<ApiCrossChainConstructor<BlockchainName> | ApiOnChainConstructor<BlockchainName>> {
    const { fromToken, toToken } = RubicApiUtils.getFromToTokens(
      response.tokens,
      quote.srcTokenAmount,
      response.estimate.destinationTokenAmount
    );

    const feeInfo = RubicApiParser.parseFeeInfoDto(response.fees);
    const routePath = RubicApiParser.parseRoutingDto(response.routing);

    const tradeParams: ApiCrossChainConstructor<BlockchainName> = {
      from: fromToken,
      to: toToken,
      feeInfo,
      routePath,
      apiQuote: quote,
      apiResponse: response
    };

    return tradeParams;
  }

  private static getFromToTokens(
    tokens: {
      from: TokenInerface;
      to: TokenInerface;
    },
    fromAmount: string,
    toAmount: string
  ): {
    fromToken: PriceTokenAmount;
    toToken: PriceTokenAmount;
  } {
    const fromTokenAddress = RubicApiUtils.parseTokenAddress(tokens.from);
    const toTokenAddress = RubicApiUtils.parseTokenAddress(tokens.to);

    const fromToken = new PriceTokenAmount({
      ...tokens.from,
      address: fromTokenAddress,
      price: new BigNumber(tokens.from.price || NaN),
      tokenAmount: new BigNumber(fromAmount)
    });
    const toToken = new PriceTokenAmount({
      ...tokens.to,
      address: toTokenAddress,
      price: new BigNumber(tokens.to.price || NaN),
      tokenAmount: new BigNumber(toAmount)
    });

    return { fromToken, toToken };
  }

  private static parseTokenAddress(token: TokenInerface): string {
    const chainType = BlockchainsInfo.getChainType(token.blockchain);
    const isNativeToken = Web3Pure.isNativeAddress(token.blockchain, token.address);

    if (isNativeToken) {
      return token.address;
    }

    if (chainType === CHAIN_TYPE.TON) {
      return Address.parseRaw(token.address).toString();
    }

    return token.address;
  }

  public static getEmptyResponse(
    fromToken: PriceTokenAmount,
    toToken: PriceTokenAmount,
    providerType: string
  ): QuoteResponseInterface {
    const swapType = fromToken.blockchain === toToken.blockchain ? 'on-chain' : 'cross-chain';

    const srcChainId = blockchainId[fromToken.blockchain];
    const dstChainId = blockchainId[toToken.blockchain];
    const nativeToken = nativeTokensList[fromToken.blockchain];
    const from = {
      ...fromToken,
      blockchainId: srcChainId
    };
    const to = {
      ...toToken,
      blockchainId: dstChainId
    };
    const emptyResponse: QuoteResponseInterface = {
      providerType: providerType as CrossChainTradeType,
      swapType,
      useRubicContract: false,
      transaction: {},
      id: '0',
      warnings: [],
      routing: [
        {
          path: [
            {
              ...from,
              amount: '0'
            },
            {
              ...to,
              amount: '0'
            }
          ],
          provider: providerType,
          type: swapType
        }
      ],
      estimate: {
        destinationTokenAmount: '0',
        destinationTokenMinAmount: '0',
        destinationWeiAmount: '0',
        destinationWeiMinAmount: '0',
        slippage: 0,
        priceImpact: 0,
        durationInMinutes: 0
      },
      tokens: {
        from,
        to
      },
      fees: {
        gasTokenFees: {
          nativeToken: {
            ...nativeToken,
            blockchainId: srcChainId
          },
          protocol: {
            fixedAmount: '0',
            fixedUsdAmount: 0,
            fixedWeiAmount: '0'
          },
          provider: {
            fixedAmount: '0',
            fixedUsdAmount: 0,
            fixedWeiAmount: '0'
          },
          gas: {
            gasPrice: '0',
            gasLimit: '0',
            totalWeiAmount: '0',
            totalUsdAmount: 0
          }
        },
        percentFees: {
          percent: 0,
          token: from
        }
      }
    };

    return emptyResponse;
  }
}
