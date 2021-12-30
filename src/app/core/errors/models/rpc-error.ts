import { RubicError } from '@core/errors/models/rubic-error';
import { RpcErrorComponent } from '@core/errors/components/rpc-error/rpc-error.component';
import { ERROR_TYPE } from '@core/errors/models/error-type';

class RpcError extends RubicError<ERROR_TYPE.COMPONENT> {
  constructor() {
    const questionId = 'rpcError';
    super(RpcErrorComponent, {
      questionId
    });
    Object.setPrototypeOf(this, RpcErrorComponent.prototype);
  }
}

export default RpcError;
