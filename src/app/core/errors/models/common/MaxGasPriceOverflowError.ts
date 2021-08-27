import { RubicError } from 'src/app/core/errors/models/RubicError';
import { ERROR_TYPE } from 'src/app/core/errors/models/error-type';
import { MaxGasPriceOverflowErrorComponent } from 'src/app/core/errors/components/max-gas-price-overflow-error/max-gas-price-overflow-error.component';

class MaxGasPriceOverflowError extends RubicError<ERROR_TYPE.COMPONENT> {
  constructor(toBlockchain: string) {
    super(MaxGasPriceOverflowErrorComponent, {
      toBlockchain
    });
    Object.setPrototypeOf(this, MaxGasPriceOverflowError.prototype);
  }
}

export default MaxGasPriceOverflowError;
