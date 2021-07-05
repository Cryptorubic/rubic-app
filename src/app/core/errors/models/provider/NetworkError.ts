import { NetworkErrorComponent } from 'src/app/core/errors/components/network-error/network-error.component';
import { RubicError } from 'src/app/core/errors/models/RubicError';

export class NetworkError extends RubicError {
  constructor(public readonly networkToChoose: string) {
    super('component', null, null, NetworkErrorComponent, { networkToChoose });
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}
