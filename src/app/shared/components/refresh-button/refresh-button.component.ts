import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  OnInit,
  Output,
  ViewChild,
  DestroyRef,
  inject
} from '@angular/core';
import { EMPTY, fromEvent, Observable } from 'rxjs';
import { mergeMap, take, tap, pairwise } from 'rxjs/operators';
import { TUI_IS_MOBILE } from '@taiga-ui/cdk';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-refresh-button',
  templateUrl: './refresh-button.component.html',
  styleUrls: ['./refresh-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RefreshButtonComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  @Input() isRotating$: Observable<boolean>;

  @Input() isRotating: () => boolean;

  @Input() mode: 'swaps' | 'limit-orders';

  @Output() onRefresh = new EventEmitter<void>();

  @ViewChild('refreshIcon', { static: true })
  refreshIconElement: ElementRef;

  constructor(@Inject(TUI_IS_MOBILE) public readonly isMobile: boolean) {}

  public ngOnInit(): void {
    // eslint-disable-next-line rxjs-angular/prefer-async-pipe
    this.isRotating$
      .pipe(
        pairwise(),
        mergeMap(([wasRotating, isRotating]) => {
          const shouldRotate = isRotating && wasRotating === false;
          const shouldStop = wasRotating && isRotating === false;

          if (shouldRotate) {
            this.refreshIconElement.nativeElement.classList.add('refresh-button__icon_refreshing');
            return EMPTY;
          } else {
            return fromEvent(this.refreshIconElement.nativeElement, 'animationiteration').pipe(
              take(1),
              tap(() => {
                if (shouldStop) {
                  this.refreshIconElement.nativeElement.classList.remove(
                    'refresh-button__icon_refreshing'
                  );
                }
              })
            );
          }
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }

  public toggleClick(): void {
    this.onRefresh.emit();
  }
}
