import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { LpRewardParsed } from '@app/core/services/backend/volume-api/models/lp-rewards';
import { BehaviorSubject } from 'rxjs';
import { LiquidityProvidingService } from '../../services/liquidity-providing.service';

@Component({
  selector: 'app-rewards-history',
  templateUrl: './rewards-history.component.html',
  styleUrls: ['./rewards-history.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RewardsHistoryComponent implements OnInit {
  public readonly columns = ['date', 'txHash', 'rewards'];

  public data: LpRewardParsed[];

  public readonly rewardsHistory$ = this.lpService.rewardsHistory$;

  private readonly _loading$ = new BehaviorSubject<boolean>(true);

  public readonly loading$ = this._loading$.asObservable();

  constructor(private readonly lpService: LiquidityProvidingService) {}

  ngOnInit(): void {
    this.loadRewards();
  }

  public loadRewards(): void {
    this._loading$.next(true);
    this.lpService.getLpRewardsHistory().subscribe(() => {
      this._loading$.next(false);
    });
  }

  public adjustTxHash(hash: string): string {
    return '0×' + hash.slice(2);
  }
}
