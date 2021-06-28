import { MetamaskErrorComponent } from 'src/app/core/errors/components/metamask-error/metamask-error.component';
import { RubicError } from 'src/app/core/errors/models/RubicError';

export class MetamaskError extends RubicError {
  constructor() {
    super('component', null, null, MetamaskErrorComponent);
    Object.setPrototypeOf(this, MetamaskError.prototype);
  }
}
