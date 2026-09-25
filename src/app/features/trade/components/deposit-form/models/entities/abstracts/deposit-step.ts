import { BehaviorSubject } from 'rxjs';
import { DepositFormSteps, DepositStepName } from '../../deposit-form-step-types';
import { DepositStepParams } from '../../step-types';
import { DepositFormState } from '../../deposit-form-states';

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

  /**
   * @internal for TaigaUI library to change propery in ngModelChange in step components
   */
  public set opened(value: boolean) {
    this._opened = value;
  }

  protected get depositFormState(): DepositFormState {
    return this._depositFormState$.value;
  }

  protected get depositFormSteps(): DepositFormSteps {
    return this._depositFormSteps$.value;
  }

  constructor(
    params: DepositStepParams,
    protected readonly _depositFormState$: BehaviorSubject<DepositFormState>,
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

  protected triggerStepsUpdate(): void {
    this._depositFormSteps$.next(this.depositFormSteps);
  }

  protected triggerFormInfoUpdate(): void {
    this._depositFormState$.next(this.depositFormState);
  }
}
