import { ERROR_TYPE } from '@core/errors/models/error-type';
import { RubicWarning } from '@core/errors/models/rubic-warning';

export class UnsupportedTokenPair extends RubicWarning<ERROR_TYPE.TEXT> {
  constructor() {
    super('The swap between this pair of tokens is unavailable.');
    Object.setPrototypeOf(this, UnsupportedTokenPair.prototype);
  }
}
