import { CrossChainDepositStatus } from 'rubic-sdk';
import { DepositStatusHandler } from './deposit-status-handler';
import { BehaviorSubject, distinctUntilChanged } from 'rxjs';

export class DepositBaseStatusHandler extends DepositStatusHandler {
  private readonly _isPendig$ = new BehaviorSubject<boolean>(false);

  private readonly _isDone$ = new BehaviorSubject<boolean>(false);

  public readonly isPending$ = this._isPendig$.asObservable().pipe(distinctUntilChanged());

  public readonly isDone$ = this._isDone$.asObservable().pipe(distinctUntilChanged());

  constructor(
    initialStatus: string,
    finishStatus: string,
    nextHandler: DepositStatusHandler | null
  ) {
    super(initialStatus, finishStatus, nextHandler);
  }

  public handleTxStatus(status: CrossChainDepositStatus): void {
    if (status === this.initialStatus) {
      this._isPendig$.next(true);
    } else if (status === this.finishStatus && !this._isDone$.getValue()) {
      this._isPendig$.next(false);
      this._isDone$.next(true);
      this._isPendig$.complete();
      this._isDone$.complete();
    }

    if (this._nextHandler && this._isDone$.getValue()) {
      this._nextHandler.handleTxStatus(status);
    }
  }
}
