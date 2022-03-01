import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { takeUntil } from 'rxjs/operators';
import { StakingService } from '../../services/staking.service';

/**
 * Page component for staking.
 */
@Component({
  selector: 'app-staking-round',
  templateUrl: './staking-round.component.html',
  styleUrls: ['./staking-round.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class StakingRoundComponent implements OnInit {
  constructor(
    private readonly stakingService: StakingService,
    private readonly cdr: ChangeDetectorRef,
    private readonly destroy$: TuiDestroyService
  ) {}

  public ngOnInit(): void {
    this.stakingService
      .handleAddressChange()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.cdr.detectChanges();
      });
  }
}
