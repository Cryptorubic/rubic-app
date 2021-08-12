import { NetworkErrorComponent } from 'src/app/core/errors/components/network-error/network-error.component';
import { RubicError } from 'src/app/core/errors/models/RubicError';
import { ERROR_TYPE } from 'src/app/core/errors/models/error-type';

export class NetworkError extends RubicError<ERROR_TYPE.COMPONENT> {
  constructor(public readonly networkToChoose: string) {
    super(NetworkErrorComponent, { networkToChoose });
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}
