import { RubicWarning } from '@core/errors/models/rubic-warning';
import { ERROR_TYPE } from '@core/errors/models/error-type';

class InvalidTradeIdError extends RubicWarning<ERROR_TYPE.TEXT> {
  constructor(tradeId: string) {
    super(`Trade with id ${tradeId} probably expired. Try to recalculate.`);
    Object.setPrototypeOf(this, InvalidTradeIdError.prototype);
  }
}

export default InvalidTradeIdError;
