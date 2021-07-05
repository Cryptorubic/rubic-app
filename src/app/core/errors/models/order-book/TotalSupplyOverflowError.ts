import { TotalSupplyOverflowErrorComponent } from 'src/app/core/errors/components/total-supply-overflow-error/total-supply-overflow-error.component';
import { RubicError } from 'src/app/core/errors/models/RubicError';

export class TotalSupplyOverflowError extends RubicError {
  constructor(public readonly tokenSymbol: string, public readonly totalSupply: string) {
    super('component', null, null, TotalSupplyOverflowErrorComponent, { tokenSymbol, totalSupply });
    Object.setPrototypeOf(this, TotalSupplyOverflowError.prototype);
  }
}
