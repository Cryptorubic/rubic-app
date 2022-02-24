import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { StakingService } from '../../services/staking.service';

/**
 * Page component for staking.
 */
@Component({
  selector: 'app-staking-page',
  templateUrl: './staking-page.component.html',
  styleUrls: ['./staking-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StakingPageComponent {
  constructor(
    private readonly stakingService: StakingService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.stakingService.handleAddressChange().subscribe(() => {
      this.cdr.detectChanges();
    });
  }
}
