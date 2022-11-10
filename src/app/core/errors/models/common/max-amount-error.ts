import { RubicError } from '@core/errors/models/rubic-error';
import { ERROR_TYPE } from '@core/errors/models/error-type';
import { MaxAmountError as SdkMaxAmountError } from 'rubic-sdk';
import BigNumber from 'bignumber.js';

class MaxAmountError extends RubicError<ERROR_TYPE.TEXT> {
  public readonly amount: BigNumber;

  public readonly tokenSymbol: string;

  constructor(maxAmountError: SdkMaxAmountError) {
    super(maxAmountError.message);

    this.amount = maxAmountError.maxAmount;
    this.tokenSymbol = maxAmountError.tokenSymbol;

    Object.setPrototypeOf(this, MaxAmountError.prototype);
  }
}

export default MaxAmountError;
