import { InsufficientFundsCcrErrorComponent } from 'src/app/core/errors/components/insufficient-funds-ccr-error/insufficient-funds-ccr-error.component';
import { ERROR_TYPE } from '@core/errors/models/error-type';
import { RubicWarning } from '@core/errors/models/rubic-warning';

class InsufficientFundsGasPriceValueError extends RubicWarning<ERROR_TYPE.TEXT> {
  constructor(nativeToken: string) {
    super(InsufficientFundsCcrErrorComponent, {
      nativeToken
    });
    Object.setPrototypeOf(this, InsufficientFundsGasPriceValueError.prototype);
  }
}

export default InsufficientFundsGasPriceValueError;
