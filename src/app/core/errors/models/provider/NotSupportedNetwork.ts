import { NotSupportedNetworkErrorComponent } from 'src/app/core/errors/components/not-supported-network-error/not-supported-network-error.component';
import { RubicError } from 'src/app/core/errors/models/RubicError';

export class NotSupportedNetworkError extends RubicError {
  constructor(networkToChoose: string) {
    super('component', null, null, NotSupportedNetworkErrorComponent, { networkToChoose });
    Object.setPrototypeOf(this, NotSupportedNetworkError.prototype);
  }
}
