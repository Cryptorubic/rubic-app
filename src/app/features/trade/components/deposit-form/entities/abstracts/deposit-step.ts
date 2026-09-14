import { DepositStepName } from '../../models/deposit-form-step-types';
import { DepositStepParams } from '../../models/step-types';

export abstract class DepositStep {
  public abstract name: DepositStepName;

  private _active: boolean;

  public get active(): boolean {
    return this._active;
  }

  private _loading: boolean;

  public get loading(): boolean {
    return this._loading;
  }

  constructor(params: DepositStepParams) {
    this._active = params.active;
    this._loading = params.loading;
  }

  public setActive(active: boolean): void {
    this._active = active;
  }

  public setLoading(loading: boolean): void {
    this._loading = loading;
  }
}
