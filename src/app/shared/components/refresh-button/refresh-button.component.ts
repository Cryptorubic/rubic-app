import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  Self,
  ViewChild
} from '@angular/core';
import { fromEvent, Observable, Subscription } from 'rxjs';
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
  @Input() isRotating$: Observable<boolean>;

  @Input() isRotating: () => boolean;

  @Input() mode: 'swaps' | 'limit-orders';

  @Output() onRefresh = new EventEmitter<void>();

  @ViewChild('refreshIcon', { static: true })
  refreshIconElement: ElementRef;

  private $refreshIconListener: Subscription;

  constructor(@Self() private readonly destroy$: TuiDestroyService) {}

  public ngOnInit(): void {
    // eslint-disable-next-line rxjs-angular/prefer-async-pipe
    this.isRotating$.pipe(takeUntil(this.destroy$)).subscribe(value => {
      if (value) {
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
        if (!this.isRotating()) {
          this.refreshIconElement.nativeElement.classList.remove('refresh-button__icon_refreshing');
        }
      });
  }

  public ngOnDestroy(): void {
    this.$refreshIconListener.unsubscribe();
  }

  public toggleClick(): void {
    this.onRefresh.emit();
  }
}
