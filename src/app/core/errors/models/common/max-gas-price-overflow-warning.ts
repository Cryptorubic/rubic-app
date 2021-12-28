import { MaxGasPriceOverflowErrorComponent } from 'src/app/core/errors/components/max-gas-price-overflow-error/max-gas-price-overflow-error.component';
import { ERROR_TYPE } from '@core/errors/models/error-type';
import { RubicWarning } from '@core/errors/models/rubic-warning';

class MaxGasPriceOverflowWarning extends RubicWarning<ERROR_TYPE.COMPONENT> {
  constructor(toBlockchain: string) {
    super(MaxGasPriceOverflowErrorComponent, {
      toBlockchain
    });
    Object.setPrototypeOf(this, MaxGasPriceOverflowWarning.prototype);
  }
}

export default MaxGasPriceOverflowWarning;
