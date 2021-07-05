import { RubicError } from 'src/app/core/errors/models/RubicError';
import { UndefinedErrorComponent } from 'src/app/core/errors/components/undefined-error/undefined-error.component';

export class UndefinedError extends RubicError {
  constructor() {
    super('component', null, null, UndefinedErrorComponent);
    Object.setPrototypeOf(this, UndefinedError.prototype);
  }
}
