import { RubicError } from '@core/errors/models/rubic-error';
import { ERROR_TYPE } from '@core/errors/models/error-type';
import { MaxAmountError as SdkMaxAmountError } from '@cryptorubic/sdk';
import BigNumber from 'bignumber.js';
import { formatBigNumber } from '@shared/utils/format-big-number';

class MaxAmountError extends RubicError<ERROR_TYPE.TEXT> {
  public readonly amount: BigNumber;

  public readonly tokenSymbol: string;

  constructor(maxAmountError: SdkMaxAmountError) {
    super(
      `Max amount is ${formatBigNumber(new BigNumber(maxAmountError.maxAmount))} ${
        maxAmountError.tokenSymbol
      }`
    );

    this.amount = maxAmountError.maxAmount;
    this.tokenSymbol = maxAmountError.tokenSymbol;

    Object.setPrototypeOf(this, MaxAmountError.prototype);
  }
}

export default MaxAmountError;
