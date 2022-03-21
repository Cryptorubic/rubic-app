import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { takeUntil } from 'rxjs/operators';
import { LiquidityProvidingService } from '../../services/liquidity-providing.service';

@Component({
  selector: 'app-lp-info',
  templateUrl: './lp-info.component.html',
  styleUrls: ['./lp-info.component.scss'],
  providers: [TuiDestroyService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LpInfoComponent implements OnInit {
  public readonly totalCollectedAmount$ = this.service.totalCollectedAmount$;

  public readonly amountToCollect$ = this.service.amountToCollect$;

  public readonly balance$ = this.service.balance$;

  public readonly apr$ = this.service.apr$;

  public readonly infoLoading$ = this.service.infoLoading$;

  constructor(
    private readonly service: LiquidityProvidingService,
    private readonly destroy$: TuiDestroyService
  ) {}

  ngOnInit(): void {
    this.service
      .getLpProvidingInfo()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.service.setInfoLoading(false);
      });
  }
}
