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

export type RefreshButtonStatus = 'refreshing' | 'in progress' | 'stopped';

@Component({
  selector: 'app-rubic-refresh-button',
  templateUrl: './rubic-refresh-button.component.html',
  styleUrls: ['./rubic-refresh-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RubicRefreshButtonComponent implements OnInit, OnDestroy {
  @Input() set loadingStatus(status: RefreshButtonStatus) {
    this.status = status;
    if (this.autoUpdate && status === 'stopped') {
      this.setupTimer();
    } else {
      clearTimeout(this.timer);
      if (status === 'refreshing') {
        setTimeout(() => {
          this.refreshIconElement.nativeElement.classList.add('refresh-button__icon_refreshing');
        });
      }
    }
  }

  @Input() set autoUpdate(value: boolean) {
    this._autoUpdate = value;
    if (value) {
      if (status === 'stopped') {
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

  public status: RefreshButtonStatus;

  private _autoUpdate: boolean;

  private timer;

  /**
   * Timeout before next refreshing in seconds
   */
  public readonly refreshTimeout = 15;

  constructor() {
    this.autoUpdate = false;
  }

  public ngOnInit(): void {
    this.refreshIconElement.nativeElement.addEventListener('animationiteration', () => {
      if (this.status !== 'refreshing') {
        this.refreshIconElement.nativeElement.classList.remove('refresh-button__icon_refreshing');
      }
    });
  }

  private setupTimer(): void {
    this.timer = setTimeout(() => {
      clearTimeout(this.timer);
      this.onRefresh.emit();
    }, this.refreshTimeout * 1000);
  }

  public ngOnDestroy(): void {
    clearTimeout(this.timer);
  }
}
