import { Component, EventEmitter, Input, Output } from '@angular/core';
import { REFRESH_STATUS } from 'src/app/shared/models/instant-trade/REFRESH_STATUS';
import Timeout = NodeJS.Timeout;

@Component({
  selector: 'app-refresh-tool',
  templateUrl: './refresh-tool.component.html',
  styleUrls: ['./refresh-tool.component.scss']
})
export class RefreshToolComponent {
  /**
   * Timeout before next refreshing in seconds
   */
  @Input() readonly refreshTimeout = 30;

  @Input() set refreshStatus(status) {
    this._refreshStatus = status;

    if (status !== REFRESH_STATUS.WAITING) {
      if (this._lastTimeoutId) {
        clearInterval(this._lastTimeoutId);
      }
    } else if (this.isWithAutoRefresh) {
      this._lastTimeoutId = setTimeout(() => this.onRefresh.emit(), this.refreshTimeout * 1000);
    }
  }

  get refreshStatus(): REFRESH_STATUS {
    return this._refreshStatus;
  }

  @Output() onRefresh = new EventEmitter<void>();

  public REFRESH_STATUS = REFRESH_STATUS;

  private _refreshStatus: REFRESH_STATUS;

  private _lastTimeoutId: Timeout;

  public set isWithAutoRefresh(value: boolean) {
    this._isWithAutoRefresh = value;
    if (value) {
      this._lastTimeoutId = setTimeout(() => this.onRefresh.emit(), this.refreshTimeout * 1000);
    } else if (this._lastTimeoutId) {
      clearInterval(this._lastTimeoutId);
    }
  }

  public get isWithAutoRefresh() {
    return this._isWithAutoRefresh;
  }

  private _isWithAutoRefresh = true;

  constructor() {}

  public onTimeoutClick(): void {
    this.isWithAutoRefresh = !this.isWithAutoRefresh;
  }

  public onRefreshClick(): void {
    if (this.refreshStatus === REFRESH_STATUS.WAITING) {
      this.onRefresh.emit();
    }
  }
}
