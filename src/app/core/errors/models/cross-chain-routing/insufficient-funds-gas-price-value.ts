import { ERROR_TYPE } from 'src/app/core/errors/models/error-type';
import { RubicWarning } from 'src/app/core/errors/models/RubicWarning';
import { InsufficientFundsCcrErrorComponent } from 'src/app/core/errors/components/insufficient-funds-ccr-error/insufficient-funds-ccr-error.component';

class InsufficientFundsGasPriceValueError extends RubicWarning<ERROR_TYPE.TEXT> {
  constructor(nativeToken: string) {
    super(InsufficientFundsCcrErrorComponent, {
      nativeToken
    });
    Object.setPrototypeOf(this, InsufficientFundsGasPriceValueError.prototype);
  }
}

export default InsufficientFundsGasPriceValueError;
