import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  Self,
  ViewChild
} from '@angular/core';
import { fromEvent, Subscription } from 'rxjs';
import { REFRESH_STATUS } from '@features/swaps/core/services/refresh-service/models/refresh-status';
import { RefreshService } from '@features/swaps/core/services/refresh-service/refresh.service';
import { takeUntil } from 'rxjs/operators';
import { TuiDestroyService } from '@taiga-ui/cdk';

@Component({
  selector: 'app-refresh-button',
  templateUrl: './refresh-button.component.html',
  styleUrls: ['./refresh-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class RefreshButtonComponent implements OnInit, OnDestroy {
  @ViewChild('refreshIcon', { static: true }) refreshIconElement: ElementRef;

  private $refreshIconListener: Subscription;

  constructor(
    private readonly refreshService: RefreshService,
    @Self() private readonly destroy$: TuiDestroyService
  ) {}

  public ngOnInit(): void {
    // eslint-disable-next-line rxjs-angular/prefer-async-pipe
    this.refreshService.status$.pipe(takeUntil(this.destroy$)).subscribe(status => {
      if (status !== REFRESH_STATUS.STOPPED) {
        this.refreshIconElement.nativeElement.classList.add('refresh-button__icon_refreshing');
      }
    });

    this.$refreshIconListener = fromEvent(
      this.refreshIconElement.nativeElement,
      'animationiteration'
    )
      .pipe(takeUntil(this.destroy$))
      // eslint-disable-next-line rxjs-angular/prefer-async-pipe
      .subscribe(() => {
        if (this.refreshService.status === REFRESH_STATUS.STOPPED) {
          this.refreshIconElement.nativeElement.classList.remove('refresh-button__icon_refreshing');
        }
      });
  }

  public ngOnDestroy(): void {
    this.$refreshIconListener.unsubscribe();
  }

  public toggleClick(): void {
    this.refreshService.onButtonClick();
  }
}
