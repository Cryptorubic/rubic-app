import { NotSupportedNetworkErrorComponent } from 'src/app/core/errors/components/not-supported-network-error/not-supported-network-error.component';
import { RubicError } from '@core/errors/models/rubic-error';
import { ERROR_TYPE } from '@core/errors/models/error-type';

export class NotSupportedNetworkError extends RubicError<ERROR_TYPE.COMPONENT> {
  constructor(networkToChoose: string) {
    super(NotSupportedNetworkErrorComponent, { networkToChoose });
    Object.setPrototypeOf(this, NotSupportedNetworkError.prototype);
  }
}
