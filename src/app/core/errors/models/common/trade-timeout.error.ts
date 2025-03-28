import { RubicError } from '@core/errors/models/rubic-error';
import { ERROR_TYPE } from '@core/errors/models/error-type';

class TradeTimeoutError extends RubicError<ERROR_TYPE.TEXT> {
  constructor() {
    super('Transaction data expired. Need recalculate!');
    Object.setPrototypeOf(this, TradeTimeoutError.prototype);
  }
}

export default TradeTimeoutError;
