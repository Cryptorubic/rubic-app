import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { BehaviorSubject, map, share, switchMap, takeWhile, tap, timer } from 'rxjs';
import { msToFriendlyTime } from './utils/ms-to-friendly-time';

@Component({
  selector: 'app-timer',
  standalone: false,
  templateUrl: './timer.component.html',
  styleUrl: './timer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimerComponent {
  @Input() text: string = '';

  @Input() set expiresAfterMs(value: number) {
    this._expiresAfterMs$.next(value);
  }

  @Output() timerCompleted: EventEmitter<void> = new EventEmitter();

  /**
   * every second emits time passed from start in ms
   */
  @Output() timerTicked: EventEmitter<number> = new EventEmitter();

  private readonly _expiresAfterMs$ = new BehaviorSubject<number>(30_000);

  private readonly reverseTimerMs$ = this._expiresAfterMs$.pipe(
    switchMap(expiresAfterMs => {
      const deadlineTimestampMs = expiresAfterMs + 1_000 + Date.now();
      const intervalDelayMs = 1_000;
      return timer(0, intervalDelayMs).pipe(
        tap(count => this.timerTicked.emit(count * intervalDelayMs)),
        map(count => expiresAfterMs - count * intervalDelayMs),
        takeWhile(() => Date.now() <= deadlineTimestampMs),
        tap({ complete: () => this.timerCompleted.emit() })
      );
    }),
    share()
  );

  public readonly reverseTimerFriendly$ = this.reverseTimerMs$.pipe(
    map(msLeft => msToFriendlyTime(msLeft))
  );
}
