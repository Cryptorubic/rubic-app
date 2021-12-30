import { RubicError } from '@core/errors/models/rubic-error';
import { UnknownErrorComponent } from 'src/app/core/errors/components/unknown-error/unknown-error.component';
import { ERROR_TYPE } from '@core/errors/models/error-type';

export class UnknownError extends RubicError<ERROR_TYPE.COMPONENT> {
  constructor(message?: string) {
    super(UnknownErrorComponent, null, message);
    Object.setPrototypeOf(this, UnknownErrorComponent.prototype);
  }
}
