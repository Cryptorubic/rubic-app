import { Component, Input, Output, EventEmitter } from '@angular/core';
import { REFRESH_BUTTON_STATUS } from '../../models/instant-trade/REFRESH_BUTTON_STATUS';
import Timeout = NodeJS.Timeout;

@Component({
  selector: 'app-refresh-button',
  templateUrl: './refresh-button.component.html',
  styleUrls: ['./refresh-button.component.scss']
})
export class RefreshButtonComponent {
  private readonly REFRESHING_TIMEOUT = 60000;

  @Input() set refreshButtonStatus(status) {
    this._refreshButtonStatus = status;
    if (status === REFRESH_BUTTON_STATUS.STAYING || status === REFRESH_BUTTON_STATUS.REFRESHING) {
      if (this._lastRefreshButtonTimeoutId) {
        clearInterval(this._lastRefreshButtonTimeoutId);
      }
    } else if (status === REFRESH_BUTTON_STATUS.WAITING) {
      this._lastRefreshButtonTimeoutId = setTimeout(
        () => this.onRefreshButtonActivated.emit(),
        this.REFRESHING_TIMEOUT
      );
    }
  }

  get refreshButtonStatus(): REFRESH_BUTTON_STATUS {
    return this._refreshButtonStatus;
  }

  @Output() onRefreshButtonActivated = new EventEmitter<void>();

  public REFRESH_BUTTON_STATUS = REFRESH_BUTTON_STATUS;

  private _refreshButtonStatus: REFRESH_BUTTON_STATUS;

  private _lastRefreshButtonTimeoutId: Timeout;

  constructor() {}

  public onClick(): void {
    this.onRefreshButtonActivated.emit();
  }
}
