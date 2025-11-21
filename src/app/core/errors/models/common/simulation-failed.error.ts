import { ERROR_TYPE } from '../error-type';
import { RubicError } from '../rubic-error';
import { SimulationFailedErrorComponent } from '../../components/simulation-failed-error/simulation-failed-error.component';
import { SwapErrorResponseInterface } from '@cryptorubic/web3';

export class SimulationFailedError extends RubicError<ERROR_TYPE.COMPONENT> {
  constructor(apiError: SwapErrorResponseInterface) {
    super(SimulationFailedErrorComponent, { apiError }, 'Transaction simulation failed!');
    Object.setPrototypeOf(this, SimulationFailedError.prototype);
  }
}
