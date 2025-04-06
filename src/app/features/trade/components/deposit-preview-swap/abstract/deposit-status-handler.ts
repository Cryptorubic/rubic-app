import { CrossChainDepositStatus } from 'rubic-sdk';
import { Observable } from 'rxjs';
import { DEPOSIT_STATUS_LABELS } from '../constants/deposit-status-labels';

export abstract class DepositStatusHandler {
  protected _nextHandler: DepositStatusHandler | null;

  protected readonly initialStatus: string;

  public readonly finishStatus: string;

  public abstract readonly isPending$: Observable<boolean>;

  public abstract readonly isDone$: Observable<boolean>;

  constructor(
    initialStatus: string,
    finishStatus: string,
    nextHandler: DepositStatusHandler | null
  ) {
    this._nextHandler = nextHandler;
    this.initialStatus = initialStatus;
    this.finishStatus = finishStatus;
  }

  public abstract handleTxStatus(status: CrossChainDepositStatus): void;

  public setNextHandler(nextHandler: DepositStatusHandler): void {
    this._nextHandler = nextHandler;
  }

  public getStatusLabel(): string {
    return DEPOSIT_STATUS_LABELS[this.initialStatus];
  }
}
