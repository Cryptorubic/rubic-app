import {
  Component,
  ChangeDetectionStrategy,
  EventEmitter,
  Output,
  OnInit,
  OnDestroy,
  Input,
  ViewChild,
  ElementRef
} from '@angular/core';
import { fromEvent } from 'rxjs';

export enum REFRESH_BUTTON_STATUS {
  REFRESHING = 'refreshing',
  IN_PROGRESS = 'in progress',
  STOPPED = 'stopped'
}

@Component({
  selector: 'app-rubic-refresh-button',
  templateUrl: './rubic-refresh-button.component.html',
  styleUrls: ['./rubic-refresh-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RubicRefreshButtonComponent implements OnInit, OnDestroy {
  @Input() set loadingStatus(status: REFRESH_BUTTON_STATUS) {
    this.status = status;
    if (this.autoUpdate && status === REFRESH_BUTTON_STATUS.STOPPED) {
      this.setupTimer();
    } else {
      clearTimeout(this.timer);
      if (status === REFRESH_BUTTON_STATUS.REFRESHING) {
        setTimeout(() => {
          this.refreshIconElement.nativeElement.classList.add('refresh-button__icon_refreshing');
        });
      }
    }
  }

  @Input() set autoUpdate(value: boolean) {
    this._autoUpdate = value;
    if (value) {
      if (this.status === REFRESH_BUTTON_STATUS.STOPPED) {
        this.setupTimer();
      }
    } else {
      clearTimeout(this.timer);
    }
  }

  get autoUpdate(): boolean {
    return this._autoUpdate;
  }

  @Output() onRefresh = new EventEmitter<void>();

  @ViewChild('refreshIcon', { static: true }) refreshIconElement: ElementRef;

  public REFRESH_BUTTON_STATUS = REFRESH_BUTTON_STATUS;

  public status: REFRESH_BUTTON_STATUS;

  private _autoUpdate: boolean;

  private timer;

  /**
   * Timeout before next refreshing in seconds
   */
  public readonly refreshTimeout = 15;

  private refreshIconListener;

  constructor() {
    this.autoUpdate = false;
  }

  public ngOnInit(): void {
    this.refreshIconListener = fromEvent(
      this.refreshIconElement.nativeElement,
      'animationiteration'
    ).subscribe(() => {
      if (this.status !== REFRESH_BUTTON_STATUS.REFRESHING) {
        this.refreshIconElement.nativeElement.classList.remove('refresh-button__icon_refreshing');
      }
    });
  }

  public ngOnDestroy(): void {
    clearTimeout(this.timer);
    this.refreshIconListener.unsubscribe();
  }

  private setupTimer(): void {
    this.timer = setTimeout(() => {
      clearTimeout(this.timer);
      this.onRefresh.emit();
    }, this.refreshTimeout * 1000);
  }
}
