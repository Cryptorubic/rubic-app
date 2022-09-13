import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { fromEvent, Subscription } from 'rxjs';
import { SettingsService } from 'src/app/features/swaps/features/main-form/services/settings-service/settings.service';
import { SWAP_PROVIDER_TYPE } from '@features/swaps/features/main-form/models/swap-provider-type';

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
  @Input() public type: 'refresh' | 'autoRefresh';

  @Input() set loadingStatus(status: REFRESH_BUTTON_STATUS) {
    this.status = status;
    if (status === REFRESH_BUTTON_STATUS.STOPPED) {
      if (this.type === 'autoRefresh') {
        this.setupTimer();
      }
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

  @Input() swapType: SWAP_PROVIDER_TYPE;

  @Output() onRefresh = new EventEmitter<void>();

  @ViewChild('refreshIcon', { static: true }) refreshIconElement: ElementRef;

  public REFRESH_BUTTON_STATUS = REFRESH_BUTTON_STATUS;

  public status: REFRESH_BUTTON_STATUS;

  private _autoUpdate: boolean;

  private timer: NodeJS.Timeout;

  /**
   * Timeout before next refreshing in seconds
   */
  public readonly refreshTimeout = 30;

  private $refreshIconListener: Subscription;

  public imageUrl: string;

  public stopAnimation: boolean;

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly settingsService: SettingsService
  ) {
    this.autoUpdate = false;
    this.imageUrl = 'assets/images/icons/reload.svg';
  }

  public ngOnInit(): void {
    this.$refreshIconListener = fromEvent(
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
    this.$refreshIconListener.unsubscribe();
  }

  private setupTimer(): void {
    this.timer = setTimeout(() => {
      clearTimeout(this.timer);
      this.onRefresh.emit();
    }, this.refreshTimeout * 1000);
  }

  public toggleClick(): void {
    this.onRefresh.emit();
  }
}
