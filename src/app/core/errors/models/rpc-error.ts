import { RubicError } from 'src/app/core/errors/models/RubicError';
import { ERROR_TYPE } from 'src/app/core/errors/models/error-type';
import { RpcErrorComponent } from '@core/errors/components/rpc-error/rpc-error.component';

export class RpcError extends RubicError<ERROR_TYPE.COMPONENT> {
  constructor(message?: string) {
    super(RpcErrorComponent, null, message);
    Object.setPrototypeOf(this, RpcErrorComponent.prototype);
  }
}
