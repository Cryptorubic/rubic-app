import { ERROR_TYPE } from 'src/app/core/errors/models/error-type';
import { MaxGasPriceOverflowErrorComponent } from 'src/app/core/errors/components/max-gas-price-overflow-error/max-gas-price-overflow-error.component';
import { RubicWarning } from 'src/app/core/errors/models/RubicWarning';

class MaxGasPriceOverflowWarning extends RubicWarning<ERROR_TYPE.COMPONENT> {
  constructor(toBlockchain: string) {
    super(MaxGasPriceOverflowErrorComponent, {
      toBlockchain
    });
    Object.setPrototypeOf(this, MaxGasPriceOverflowWarning.prototype);
  }
}

export default MaxGasPriceOverflowWarning;
