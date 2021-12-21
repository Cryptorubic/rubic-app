import { RubicError } from 'src/app/core/errors/models/RubicError';
import { ERROR_TYPE } from 'src/app/core/errors/models/error-type';
import { RpcErrorComponent } from '@core/errors/components/rpc-error/rpc-error.component';

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
