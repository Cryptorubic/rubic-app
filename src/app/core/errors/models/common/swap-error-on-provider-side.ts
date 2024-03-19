import { ERROR_TYPE } from '../error-type';
import { RubicError } from '../rubic-error';

class SwapErorOnProviderSide extends RubicError<ERROR_TYPE.TEXT> {
  constructor() {
    super("Trade was interrupted on the provider's side. Please refresh the page and try again.");
    Object.setPrototypeOf(this, SwapErorOnProviderSide.prototype);
  }
}

export default SwapErorOnProviderSide;
