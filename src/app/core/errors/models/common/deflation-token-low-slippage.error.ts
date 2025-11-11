import { ERROR_TYPE } from '@core/errors/models/error-type';
import { RubicError } from '../rubic-error';

class DeflationTokenLowSlippageError extends RubicError<ERROR_TYPE.TEXT> {
  constructor(tokenAddress: string) {
    super(
      `Token ${tokenAddress} is deflationary and charges its own transaction fee.
Try increasing your slippage tolerance, it may help your swap go through successfully.`
    );
    Object.setPrototypeOf(this, DeflationTokenLowSlippageError.prototype);
  }
}

export default DeflationTokenLowSlippageError;
