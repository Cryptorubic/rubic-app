import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { WalletConnectorService } from '@app/core/services/blockchain/wallets/wallet-connector-service/wallet-connector.service';
import { EMPTY, of } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';
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

  public readonly lpAprByRound$ = this.stakingLpService.lpAprByRound$;

  public readonly lpBalanceByRound$ = this.stakingLpService.lpBalanceByRound$;

  public readonly lpRoundStarted$ = this.stakingLpService.lpRoundStarted$;

  constructor(
    private readonly router: Router,
    private readonly stakingLpService: StakingLpService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.walletConnectorService.addressChange$
      .pipe(
        startWith(undefined),
        switchMap(address => {
          if (address === null) {
            this.stakingLpService.resetStakingBalances();
            this.stakingLpService.resetLpBalances();
            return EMPTY;
          } else {
            return of(null);
          }
        }),
        switchMap(() => this.stakingLpService.getStakingBalanceByRound()),
        switchMap(() => this.stakingLpService.getLpBalanceAndAprByRound())
      )
      .subscribe(() => {
        this.cdr.detectChanges();
      });
  }

  navigateToStaking(round: number): void {
    const roundRoutePath = round === 1 ? 'round-one' : 'round-two';
    this.router.navigate(['staking', roundRoutePath]);
  }

  navigateToLp(isStarted: boolean): void {
    if (isStarted) {
      this.router.navigate(['liquidity-providing']);
    } else {
      this.router.navigateByUrl('https://rubic.exchange/');
    }
  }
}
