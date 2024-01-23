import { NetworkErrorComponent } from 'src/app/core/errors/components/network-error/network-error.component';
import { RubicError } from '@core/errors/models/rubic-error';
import { ERROR_TYPE } from '@core/errors/models/error-type';

export class NetworkError extends RubicError<ERROR_TYPE.COMPONENT> {
  public isWarning = true;

  constructor(public readonly networkToChoose: string) {
    super(NetworkErrorComponent, { networkToChoose });
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}
