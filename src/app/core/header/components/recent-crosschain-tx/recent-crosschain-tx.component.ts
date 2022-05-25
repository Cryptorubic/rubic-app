import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { RecentTradesService } from '@app/shared/services/recent-trades.service';
import { BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-recent-crosschain-tx',
  templateUrl: './recent-crosschain-tx.component.html',
  styleUrls: ['./recent-crosschain-tx.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecentCrosschainTxComponent implements OnInit {
  private readonly _loading$ = new BehaviorSubject<boolean>(false);

  public readonly loading$ = this._loading$.asObservable();

  public readonly recentTrades$ = this.recentTradesService.recentTrades$.pipe(tap(console.log));

  constructor(private readonly recentTradesService: RecentTradesService) {}

  ngOnInit(): void {
    return undefined;
  }
}
