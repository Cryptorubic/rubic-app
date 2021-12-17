import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormControl } from '@ngneat/reactive-forms';
import { StakingService } from '@features/staking/services/staking.service';
import { startWith, switchMap } from 'rxjs/operators';
import { WalletsModalService } from '@core/wallets/services/wallets-modal.service';

@Component({
  selector: 'app-withdraw',
  templateUrl: './withdraw.component.html',
  styleUrls: ['./withdraw.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WithdrawComponent {
  public readonly DEFAULT_DECIMALS = 18;

  public amount = new FormControl<string>('');

  public needLogin$ = this.stakingService.needLogin$;

  public stakingTokenBalance$ = this.stakingService.stakingTokenBalance$;

  public canReceive$ = this.amount.valueChanges.pipe(
    startWith(this.amount.value),
    switchMap(amount => this.stakingService.calculateLeaveReward(amount))
  );

  constructor(
    private readonly stakingService: StakingService,
    private readonly walletsModalService: WalletsModalService
  ) {}

  public withdraw(): void {
    this.stakingService.leaveStake(this.amount.value).subscribe(console.log);
  }

  public login(): void {
    this.walletsModalService.open().subscribe();
  }
}
