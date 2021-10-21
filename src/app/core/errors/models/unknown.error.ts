import { RubicError } from 'src/app/core/errors/models/RubicError';
import { ERROR_TYPE } from 'src/app/core/errors/models/error-type';
import { UnknownErrorComponent } from 'src/app/core/errors/components/unknown-error/unknown-error.component';

export class UnknownError extends RubicError<ERROR_TYPE.COMPONENT> {
  constructor(message?: string) {
    super(UnknownErrorComponent, null, message);
    Object.setPrototypeOf(this, UnknownErrorComponent.prototype);
  }
}
