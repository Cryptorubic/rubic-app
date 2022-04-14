import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { WalletConnectorService } from '@app/core/services/blockchain/wallets/wallet-connector-service/wallet-connector.service';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { EMPTY, of } from 'rxjs';
import { startWith, switchMap, takeUntil } from 'rxjs/operators';
import { RoundStatus } from '../../models/round-status.enum';
import { StakingLpService } from '../../services/staking-lp.service';

@Component({
  selector: 'app-lp-rounds',
  templateUrl: './lp-rounds.component.html',
  styleUrls: ['./lp-rounds.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class LpRoundsComponent implements OnInit {
  public readonly roundStatus = RoundStatus;

  public readonly lpAprByRound$ = this.stakingLpService.lpAprByRound$;

  public readonly lpBalanceByRound$ = this.stakingLpService.lpBalanceByRound$;

  public readonly lpRoundStarted$ = this.stakingLpService.lpRoundStarted$;

  public readonly lpRoundEnded$ = this.stakingLpService.lpRoundEnded$;

  constructor(
    private readonly stakingLpService: StakingLpService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly router: Router,
    private readonly destroy$: TuiDestroyService
  ) {}

  ngOnInit(): void {
    this.stakingLpService.getLpAprByRound().subscribe();

    this.loadLpBalances();
  }

  public navigateToLp(): void {
    this.router.navigate(['liquidity-providing']);
  }

  public getLpStatuses(isStarted: boolean): RoundStatus[] {
    const isEnded = this.stakingLpService.lpRoundEnded;
    if (isEnded) {
      return [RoundStatus.CLOSED];
    }

    if (isStarted) {
      return [RoundStatus.ACTIVE];
    }
  }

  private loadLpBalances(): void {
    this.walletConnectorService.addressChange$
      .pipe(
        startWith(undefined),
        switchMap(address => {
          if (address === null) {
            this.stakingLpService.resetLpBalances();
            return EMPTY;
          } else {
            return of(null);
          }
        }),
        switchMap(() => this.stakingLpService.getLpBalanceByRound()),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }
}
