import { ERROR_TYPE } from 'src/app/core/errors/models/error-type';
import { RubicError } from 'src/app/core/errors/models/RubicError';

export abstract class RubicWarning<T extends ERROR_TYPE> extends RubicError<T> {
  protected constructor(...args: unknown[]) {
    // @ts-ignore
    super(...args);
    Object.setPrototypeOf(this, RubicWarning.prototype);
  }
}
