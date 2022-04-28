import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { WalletConnectorService } from '@app/core/services/blockchain/wallets/wallet-connector-service/wallet-connector.service';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { EMPTY, of } from 'rxjs';
import { startWith, switchMap, takeUntil } from 'rxjs/operators';
import { RoundStatus } from '../../models/round-status.enum';
import { StakingLpService } from '../../services/staking-lp.service';

@Component({
  selector: 'app-staking-rounds',
  templateUrl: './staking-rounds.component.html',
  styleUrls: ['./staking-rounds.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class StakingRoundsComponent implements OnInit {
  public readonly roundStatus = RoundStatus;

  public readonly stakingBalanceByRound$ = this.stakingLpService.stakingBalanceByRound$;

  constructor(
    private readonly stakingLpService: StakingLpService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly router: Router,
    private readonly destroy$: TuiDestroyService
  ) {}

  ngOnInit(): void {
    this.watchCurrentUserStakingBalanceByRound();
  }

  private watchCurrentUserStakingBalanceByRound(): void {
    this.walletConnectorService.addressChange$
      .pipe(
        startWith(undefined),
        switchMap(address => {
          if (address === null) {
            this.stakingLpService.resetStakingBalances();
            return EMPTY;
          } else {
            return of(null);
          }
        }),
        switchMap(() => this.stakingLpService.getStakingBalanceByRound()),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  public navigateToStaking(round: number): void {
    const roundRoutePath = round === 1 ? 'round-one' : 'round-two';
    this.router.navigate(['staking', roundRoutePath]);
  }
}
