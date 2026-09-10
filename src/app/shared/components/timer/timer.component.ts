import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { BehaviorSubject, finalize, interval, map, share, switchMap, takeWhile } from 'rxjs';

@Component({
  selector: 'app-timer',
  standalone: false,
  templateUrl: './timer.component.html',
  styleUrl: './timer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimerComponent {
  @Input() set expiresAfterMs(value: number) {
    this._expiresAfterMs$.next(value);
  }

  @Output() timerCompleted: EventEmitter<void> = new EventEmitter();

  private readonly _expiresAfterMs$ = new BehaviorSubject<number>(30_000);

  private readonly reverseTimerMs$ = this._expiresAfterMs$.pipe(
    switchMap(expiresAfterMs => {
      const deadlineTimestampMs = expiresAfterMs + Date.now();
      const intervalDelayMs = 1_000;
      return interval(intervalDelayMs).pipe(
        takeWhile(() => Date.now() <= deadlineTimestampMs),
        map(count => expiresAfterMs - count * intervalDelayMs),
        finalize(() => this.timerCompleted.emit())
      );
    }),
    share({ resetOnRefCountZero: true, resetOnComplete: true })
  );

  public readonly reverseTimerFriendly$ = this.reverseTimerMs$.pipe(
    map(msLeft => this.msToFriendlyTime(msLeft))
  );

  constructor() {}

  private msToFriendlyTime(timestamp: number): string {
    let timestampInSecs = Math.floor(timestamp / 1000);
    const hours = Math.floor(timestampInSecs / 3600);
    timestampInSecs = timestampInSecs - hours * 3600;
    const minutes = Math.floor(timestampInSecs / 60);
    timestampInSecs = timestampInSecs - minutes * 60;
    const seconds = timestampInSecs;

    const hh = hours < 10 ? `0${hours}` : `${hours}`;
    const mm = minutes < 10 ? `0${minutes}` : `${minutes}`;
    const ss = seconds < 10 ? `0${seconds}` : `${seconds}`;

    return hh === '00' ? `${mm}:${ss}` : `${hh}:${mm}:${ss}`;
  }
}
