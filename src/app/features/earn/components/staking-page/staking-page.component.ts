import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import { StakingService } from '../../services/staking.service';

@Component({
  selector: 'app-staking',
  templateUrl: './staking-page.component.html',
  styleUrls: ['./staking-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StakingPageComponent {
  public readonly deposits$ = this.stakingService.deposits$;

  public readonly depositsLoading$ = this.stakingService.depositsLoading$;

  public readonly needLogin$ = this.stakingService.needLogin$;

  constructor(private readonly router: Router, private readonly stakingService: StakingService) {}

  public navigateToStakeForm(): void {
    this.router.navigate(['staking', 'new-position']);
  }
}
