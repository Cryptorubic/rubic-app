import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import { WalletsModalService } from '@app/core/wallets/services/wallets-modal.service';
import { RoundStatus } from '../../models/round-status.enum';
import { StakingService } from '../../services/staking.service';

@Component({
  selector: 'app-staking',
  templateUrl: './staking-page.component.html',
  styleUrls: ['./staking-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StakingPageComponent {
  public accordionState = false;

  public readonly RoundStatus = RoundStatus;

  public readonly needLogin$ = this.stakingService.needLogin$;

  constructor(
    private readonly router: Router,
    private readonly stakingService: StakingService,
    private readonly walletsModalService: WalletsModalService
  ) {}

  public toggleAccordion(): void {
    this.accordionState = !this.accordionState;
  }

  public navigateToStakeForm(): void {
    this.router.navigate(['staking', 'new-position']);
  }

  public login(): void {
    this.walletsModalService.open().subscribe();
  }
}
