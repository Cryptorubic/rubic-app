import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { takeUntil } from 'rxjs/operators';
import { LiquidityProvidingService } from '../../services/liquidity-providing.service';

@Component({
  selector: 'app-lp-progress',
  templateUrl: './lp-progress.component.html',
  styleUrls: ['./lp-progress.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class LpProgressComponent implements OnInit {
  public readonly poolSize = this.service.poolSize;

  public readonly maxEnterAmount = this.service.maxEnterAmount;

  public readonly totalStaked$ = this.service.totalStaked$;

  public readonly usersTotalStaked$ = this.service.userTotalStaked$;

  public readonly needLogin$ = this.service.needLogin$;

  public readonly progressLoading$ = this.service.progressLoading$;

  constructor(
    private readonly service: LiquidityProvidingService,
    private readonly destroy$: TuiDestroyService
  ) {}

  public ngOnInit(): void {
    this.service
      .getLpProvidingProgress()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.service.setProgressLoading(false);
      });
  }
}
