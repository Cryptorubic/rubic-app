import { NotSupportedNetworkErrorComponent } from 'src/app/core/errors/components/not-supported-network-error/not-supported-network-error.component';
import { RubicError } from 'src/app/core/errors/models/RubicError';
import { ERROR_TYPE } from 'src/app/core/errors/models/error-type';

export class NotSupportedNetworkError extends RubicError<ERROR_TYPE.COMPONENT> {
  constructor(networkToChoose: string) {
    super(NotSupportedNetworkErrorComponent, { networkToChoose });
    Object.setPrototypeOf(this, NotSupportedNetworkError.prototype);
  }
}
