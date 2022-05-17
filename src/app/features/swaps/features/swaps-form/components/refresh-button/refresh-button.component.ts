import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  Self,
  ViewChild
} from '@angular/core';
import { fromEvent, takeUntil } from 'rxjs';
import { RefreshButtonService } from '@features/swaps/core/services/refresh-button-service/refresh-button.service';
import { REFRESH_BUTTON_STATUS } from '@features/swaps/core/services/refresh-button-service/models/refresh-button-status';
import { TuiDestroyService } from '@taiga-ui/cdk';

const ICON_BASE_PATH = 'assets/images/icons/reload/';

@Component({
  selector: 'app-refresh-button',
  templateUrl: './refresh-button.component.html',
  styleUrls: ['./refresh-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class RefreshButtonComponent implements OnInit {
  @ViewChild('refreshIcon', { static: true }) refreshIconElement: ElementRef;

  public readonly REFRESH_BUTTON_STATUS = REFRESH_BUTTON_STATUS;

  public readonly status$ = this.refreshButtonService.status$;

  public readonly autoRefresh$ = this.refreshButtonService.autoRefresh$;

  public readonly refreshTimeout = this.refreshButtonService.AUTO_REFRESHING_TIMEOUT;

  public imageUrl = `${ICON_BASE_PATH}reload.svg`;

  public stopAnimation: boolean;

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly refreshButtonService: RefreshButtonService,
    @Self() private readonly destroy$: TuiDestroyService
  ) {}

  public ngOnInit(): void {
    this.setupRefreshAnimation();
  }

  /**
   * Subscribes on refresh events, to make animation smooth.
   */
  private setupRefreshAnimation(): void {
    this.status$
      .pipe(takeUntil(this.destroy$))
      // eslint-disable-next-line rxjs-angular/prefer-async-pipe
      .subscribe(() => {
        if (this.refreshButtonService.status === REFRESH_BUTTON_STATUS.REFRESHING) {
          this.refreshIconElement.nativeElement.classList.add('refresh-button__icon_refreshing');
        }
      });

    fromEvent(this.refreshIconElement.nativeElement, 'animationiteration')
      .pipe(takeUntil(this.destroy$))
      // eslint-disable-next-line rxjs-angular/prefer-async-pipe
      .subscribe(() => {
        if (this.refreshButtonService.status !== REFRESH_BUTTON_STATUS.REFRESHING) {
          this.refreshIconElement.nativeElement.classList.remove('refresh-button__icon_refreshing');
        }
      });
  }

  public mouseEnter(): void {
    this.stopAnimation = true;
    this.updateImageOnEnter();
  }

  private updateImageOnEnter(): void {
    if (this.refreshButtonService.autoRefresh) {
      this.imageUrl = `${ICON_BASE_PATH}pause.svg`;
    } else {
      this.imageUrl = `${ICON_BASE_PATH}play.svg`;
    }
  }

  public mouseLeave(): void {
    if (this.refreshButtonService.status !== REFRESH_BUTTON_STATUS.REFRESHING) {
      this.refreshIconElement.nativeElement.classList.remove('refresh-button__icon_refreshing');
    }

    this.imageUrl = `${ICON_BASE_PATH}reload.svg`;
    this.stopAnimation = false;
  }

  public toggleClick(): void {
    this.refreshButtonService.toggleAutoRefresh();
    this.updateImageOnEnter();
  }
}
