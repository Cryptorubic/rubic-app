import { MetamaskErrorComponent } from 'src/app/core/errors/components/metamask-error/metamask-error.component';
import { RubicError } from 'src/app/core/errors/models/RubicError';
import { ERROR_TYPE } from 'src/app/core/errors/models/error-type';

export class MetamaskError extends RubicError<ERROR_TYPE.COMPONENT> {
  constructor() {
    super(MetamaskErrorComponent);
    Object.setPrototypeOf(this, MetamaskError.prototype);
  }
}
