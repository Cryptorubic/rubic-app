import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { BehaviorSubject, finalize, map, share, switchMap, takeWhile, timer } from 'rxjs';

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

  private readonly _expiresAfterMs$ = new BehaviorSubject<number>(30_000);

  private readonly reverseTimerMs$ = this._expiresAfterMs$.pipe(
    switchMap(expiresAfterMs => {
      const deadlineTimestampMs = expiresAfterMs + 1_000 + Date.now();
      const intervalDelayMs = 1_000;
      return timer(0, intervalDelayMs).pipe(
        map(count => expiresAfterMs - count * intervalDelayMs),
        takeWhile(() => Date.now() <= deadlineTimestampMs),
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
