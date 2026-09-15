import { BehaviorSubject } from 'rxjs';
import { DepositFormSteps, DepositStepName } from '../../deposit-form-step-types';
import { DepositStepParams } from '../../step-types';
import { DepositFormInfo } from '../../deposit-form-info';

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

  private _opened: boolean;

  public get opened(): boolean {
    return this._opened;
  }

  public get depositFormInfo(): DepositFormInfo {
    return this._depositFormInfo$.value;
  }

  public get depositFormSteps(): DepositFormSteps {
    return this._depositFormSteps$.value;
  }

  constructor(
    params: DepositStepParams,
    protected readonly _depositFormInfo$: BehaviorSubject<DepositFormInfo>,
    protected readonly _depositFormSteps$: BehaviorSubject<DepositFormSteps>
  ) {
    this._active = params.active;
    this._loading = params.loading;
    this._opened = params.opened;
  }

  public setActive(active: boolean): void {
    this._active = active;
  }

  public setLoading(loading: boolean): void {
    this._loading = loading;
  }

  public setOpened(opened: boolean): void {
    this._opened = opened;
  }
}
