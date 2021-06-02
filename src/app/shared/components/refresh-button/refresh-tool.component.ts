import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { REFRESH_STATUS } from 'src/app/shared/models/instant-trade/REFRESH_STATUS';
import Timeout = NodeJS.Timeout;

@Component({
  selector: 'app-refresh-tool',
  templateUrl: './refresh-tool.component.html',
  styleUrls: ['./refresh-tool.component.scss']
})
export class RefreshToolComponent implements OnInit {
  /**
   * Timeout before next refreshing in seconds
   */
  @Input() readonly refreshTimeout = 30;

  @Input() set refreshStatus(status) {
    if (status !== REFRESH_STATUS.WAITING) {
      if (this._lastTimeoutId) {
        clearInterval(this._lastTimeoutId);
      }
    } else if (this.isWithAutoRefresh) {
      this._lastTimeoutId = setTimeout(() => this.onRefresh.emit(), this.refreshTimeout * 1000);
    }

    if (status === REFRESH_STATUS.REFRESHING) {
      this.refreshButtonStatus = 'refreshing';
      this.refreshButton.nativeElement.classList.add('refresh-button_refreshing');
    } else if (this._refreshStatus === REFRESH_STATUS.REFRESHING) {
      this.refreshButtonStatus = 'stopped';
    }

    this._refreshStatus = status;
  }

  get refreshStatus(): REFRESH_STATUS {
    return this._refreshStatus;
  }

  @Output() onRefresh = new EventEmitter<void>();

  @ViewChild('refreshButton', { static: true }) refreshButton: ElementRef;

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

  public refreshButtonStatus: 'refreshing' | 'stopped' = 'stopped';

  constructor() {}

  ngOnInit() {
    this.refreshButton.nativeElement.addEventListener('animationiteration', () => {
      if (this.refreshButtonStatus === 'stopped') {
        this.refreshButton.nativeElement.classList.remove('refresh-button_refreshing');
      }
    });
  }

  public onTimeoutClick(): void {
    this.isWithAutoRefresh = !this.isWithAutoRefresh;
  }

  public onRefreshClick(): void {
    if (this.refreshStatus === REFRESH_STATUS.WAITING) {
      this.onRefresh.emit();
    }
  }
}
