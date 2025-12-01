import {
  FeesInterface,
  PriceToken,
  PriceTokenAmount,
  PriceTokenAmountStruct,
  RoutingInterface
} from '@cryptorubic/core';
import BigNumber from 'bignumber.js';
import { FeeInfo } from '../../cross-chain/calculation-manager/providers/common/models/fee-info';
import { RubicStep } from '../../cross-chain/calculation-manager/providers/common/models/rubicStep';

import { RubicApiErrorDto } from '../models/rubic-api-error';
import { RubicApiWarnings } from '../models/rubic-api-warnings';
import { MaxAmountError, MaxDecimalsError, MinAmountError, RubicSdkError } from '@cryptorubic/web3';

export class RubicApiParser {
  public static parseRoutingDto(routingDto: RoutingInterface[]): RubicStep[] {
    const steps: RubicStep[] = [];

    for (const route of routingDto) {
      const [from, to] = route.path;

      const fromToken = new PriceTokenAmount({
        ...(from as unknown as PriceTokenAmountStruct),
        tokenAmount: from?.amount
      });

      const toToken = new PriceTokenAmount({
        ...(to as unknown as PriceTokenAmountStruct),
        tokenAmount: to?.amount
      });

      steps.push({
        provider: route.provider,
        path: [fromToken, toToken],
        type: route.type
      });
    }

    return steps;
  }

  public static parseFeeInfoDto(feeInfoDto: FeesInterface): FeeInfo {
    const nativeToken = new PriceToken({
      ...feeInfoDto.gasTokenFees.nativeToken,
      price: new BigNumber(feeInfoDto.gasTokenFees.nativeToken.price!)
    });
    const percentToken = feeInfoDto.percentFees.token
      ? new PriceToken({
          ...feeInfoDto.percentFees.token,
          price: new BigNumber(feeInfoDto.percentFees.token.price!)
        })
      : nativeToken;
    const protocolFee = feeInfoDto.gasTokenFees.protocol;
    const providerFee = feeInfoDto.gasTokenFees.provider;
    return {
      rubicProxy: {
        fixedFee: {
          amount: new BigNumber(protocolFee.fixedAmount),
          token: nativeToken
        },
        platformFee: {
          percent: feeInfoDto.percentFees.percent,
          token: percentToken
        }
      },
      provider: {
        cryptoFee: {
          amount: new BigNumber(providerFee.fixedAmount),
          token: nativeToken
        }
      }
    };
  }

  public static parseRubicApiErrors(err: RubicApiErrorDto): RubicSdkError {
    if (err.code === 2005 || err.code === 2004) {
      const data = err.data as {
        tokenSymbol: string;
        minAmount?: string;
        maxAmount?: string;
      };
      if (data.minAmount) {
        return new MinAmountError(new BigNumber(data.minAmount), data.tokenSymbol);
      }
      if (data.maxAmount) {
        return new MaxAmountError(new BigNumber(data.maxAmount), data.tokenSymbol);
      }
    }

    if (err.code === 2006) {
      const decimals = err.reason.match(/\d+/)?.[0];
      return new MaxDecimalsError(Number(decimals));
    }

    throw new RubicSdkError(err.reason);
  }

  public static parseRubicApiWarnings(warnings: RubicApiErrorDto[]): RubicApiWarnings {
    const parsedWarnings: RubicApiWarnings = { needAuthWallet: false };

    for (const warning of warnings) {
      if (warning.code === 2007) {
        parsedWarnings.needAuthWallet = true;
        continue;
      }

      parsedWarnings.error = RubicApiParser.parseRubicApiErrors(warning);
    }

    return parsedWarnings;
  }
}
