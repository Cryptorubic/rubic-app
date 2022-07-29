import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Deposit } from '../../models/deposit.inteface';
import { StakingService } from '../../services/staking.service';
import { take } from 'rxjs/operators';
import { watch } from '@taiga-ui/cdk';

@Component({
  selector: 'app-deposits',
  templateUrl: './deposits.component.html',
  styleUrls: ['./deposits.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DepositsComponent implements OnInit {
  public readonly deposits$ = this.stakingService.deposits$;

  public readonly depositsLoading$ = this.stakingService.depositsLoading$;

  constructor(
    private readonly router: Router,
    private readonly stakingService: StakingService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  public ngOnInit(): void {
    this.stakingService.loadDeposits().pipe(watch(this.cdr)).subscribe();
  }

  public async claim(deposit: Deposit): Promise<void> {
    await this.stakingService.claim(deposit);
  }

  public async withdraw(deposit: Deposit): Promise<void> {
    await this.stakingService.withdraw(deposit);
  }

  public navigateToStakeForm(): void {
    this.router.navigate(['staking-lp', 'new-position']);
  }

  public refreshDeposits(): void {
    this.stakingService.loadDeposits().pipe(take(1)).subscribe();
  }
}
