import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RoundStatus } from '../../models/round-status.enum';
import { StakingLpService } from '../../services/staking-lp.service';

@Component({
  selector: 'app-staking-lp-page',
  templateUrl: './staking-lp-page.component.html',
  styleUrls: ['./staking-lp-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StakingLpPageComponent implements OnInit {
  public readonly roundStatus = RoundStatus;

  public readonly stakingBalanceByRound$ = this.stakingLpService.stakingBalanceByRound$;

  constructor(
    private readonly router: Router,
    private readonly stakingLpService: StakingLpService
  ) {}

  ngOnInit(): void {
    this.stakingLpService.getStakingBalanceByRound().subscribe();
  }

  navigateToStaking(round: number): void {
    const roundRoutePath = round === 1 ? 'round-one' : 'round-two';
    this.router.navigate(['staking', roundRoutePath]);
  }
}
