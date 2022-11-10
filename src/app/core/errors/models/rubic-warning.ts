import { RubicError } from '@core/errors/models/rubic-error';
import { ERROR_TYPE } from '@core/errors/models/error-type';

export abstract class RubicWarning<T extends ERROR_TYPE> extends RubicError<T> {
  protected constructor(...args: ConstructorParameters<typeof RubicError<T>>) {
    super(...args);
    Object.setPrototypeOf(this, RubicWarning.prototype);
  }
}
