import {
  Component,
  ChangeDetectionStrategy,
  EventEmitter,
  Output,
  OnInit,
  OnDestroy,
  Input
} from '@angular/core';
import { Subscription, timer } from 'rxjs';

@Component({
  selector: 'app-rubic-refresh-button',
  templateUrl: './rubic-refresh-button.component.html',
  styleUrls: ['./rubic-refresh-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RubicRefreshButtonComponent implements OnInit, OnDestroy {
  public status: 'refreshing' | 'stopped' | '';

  @Input() set loadingStatus(status: 'refreshing' | 'stopped' | '') {
    if (status) {
      this.status = status;
      if (this.autoUpdate && status !== 'refreshing') {
        this.setupTimer();
      }
    }
  }

  @Input() public autoUpdate: boolean;

  @Output() public refresh: EventEmitter<void>;

  private timer$: Subscription;

  /**
   * Timeout before next refreshing in seconds
   */
  public readonly refreshTimeout = 15;

  constructor() {
    this.refresh = new EventEmitter<void>();
    this.autoUpdate = false;
  }

  public ngOnInit(): void {
    if (this.autoUpdate) {
      this.setupTimer();
    }
  }

  private setupTimer(): void {
    this.timer$ = timer(0, 1000).subscribe((time: number) => {
      if (time === this.refreshTimeout) {
        this.timer$.unsubscribe();
        this.triggerRefresh();
      }
    });
  }

  public ngOnDestroy(): void {
    if (this.timer$) {
      this.timer$.unsubscribe();
    }
  }

  public triggerRefresh(): void {
    this.loadingStatus = 'refreshing';
    this.refresh.emit();
  }
}
