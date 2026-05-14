import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  OnInit,
  Output,
  Self,
  ViewChild
} from '@angular/core';
import { EMPTY, fromEvent, Observable } from 'rxjs';
import { takeUntil, mergeMap, take, tap, pairwise } from 'rxjs/operators';
import { TUI_IS_MOBILE, TuiDestroyService } from '@taiga-ui/cdk';

@Component({
  selector: 'app-refresh-button',
  templateUrl: './refresh-button.component.html',
  styleUrls: ['./refresh-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class RefreshButtonComponent implements OnInit {
  @Input() isRotating$: Observable<boolean>;

  @Input() isRotating: () => boolean;

  @Input() mode: 'swaps' | 'limit-orders';

  @Output() onRefresh = new EventEmitter<void>();

  @ViewChild('refreshIcon', { static: true })
  refreshIconElement: ElementRef;

  constructor(
    @Self() private readonly destroy$: TuiDestroyService,
    @Inject(TUI_IS_MOBILE) public readonly isMobile: boolean
  ) {}

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
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  public toggleClick(): void {
    this.onRefresh.emit();
  }
}
