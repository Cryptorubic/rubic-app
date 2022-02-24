import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { takeUntil } from 'rxjs/operators';
import { StakingService } from '../../services/staking.service';

/**
 * Page component for staking.
 */
@Component({
  selector: 'app-staking-page',
  templateUrl: './staking-page.component.html',
  styleUrls: ['./staking-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class StakingPageComponent {
  constructor(
    private readonly stakingService: StakingService,
    private readonly cdr: ChangeDetectorRef,
    private readonly destroy$: TuiDestroyService
  ) {}

  ngOnInit(): void {
    this.stakingService
      .handleAddressChange()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.cdr.detectChanges();
      });
  }
}
