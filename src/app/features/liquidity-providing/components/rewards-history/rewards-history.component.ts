import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { HeaderStore } from '@app/root-components/header/services/header.store';
import { ThemeService } from '@app/core/services/theme/theme.service';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { LiquidityProvidingService } from '../../services/liquidity-providing.service';

@Component({
  selector: 'app-rewards-history',
  templateUrl: './rewards-history.component.html',
  styleUrls: ['./rewards-history.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RewardsHistoryComponent implements OnInit {
  public readonly columns = ['date', 'txHash', 'rewards'];

  public readonly rewardsHistory$ = this.lpService.rewardsHistory$;

  private readonly _loading$ = new BehaviorSubject<boolean>(true);

  public readonly loading$ = this._loading$.asObservable();

  public readonly isDarkTheme$ = this.themeService.theme$.pipe(map(theme => theme === 'dark'));

  public readonly isMobile = this.headerStore.isMobile;

  constructor(
    private readonly lpService: LiquidityProvidingService,
    private readonly themeService: ThemeService,
    private readonly headerStore: HeaderStore
  ) {}

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
