import { RubicError } from 'src/app/core/errors/models/RubicError';
import { UndefinedErrorComponent } from 'src/app/core/errors/components/undefined-error/undefined-error.component';
import { ERROR_TYPE } from 'src/app/core/errors/models/error-type';

export class UndefinedError extends RubicError<ERROR_TYPE.COMPONENT> {
  constructor() {
    super(UndefinedErrorComponent);
    Object.setPrototypeOf(this, UndefinedError.prototype);
  }
}
