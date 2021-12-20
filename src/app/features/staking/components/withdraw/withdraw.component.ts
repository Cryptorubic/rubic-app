import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl } from '@ngneat/reactive-forms';
import { StakingService } from '@features/staking/services/staking.service';
import { map, startWith, switchMap } from 'rxjs/operators';
import { WalletsModalService } from '@core/wallets/services/wallets-modal.service';
import BigNumber from 'bignumber.js';

@Component({
  selector: 'app-withdraw',
  templateUrl: './withdraw.component.html',
  styleUrls: ['./withdraw.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WithdrawComponent {
  public readonly DEFAULT_DECIMALS = 18;

  public readonly amount = new FormControl<string>('');

  public readonly needLogin$ = this.stakingService.needLogin$;

  public readonly stakingTokenBalance$ = this.stakingService.stakingTokenBalance$;

  public readonly canReceive$ = this.amount.valueChanges.pipe(
    startWith(this.amount.value),
    map(value => (value ? new BigNumber(value.split(',').join('')) : new BigNumber(0))),
    switchMap(amount => this.stakingService.calculateLeaveReward(amount))
  );

  constructor(
    private readonly stakingService: StakingService,
    private readonly walletsModalService: WalletsModalService
  ) {}

  public withdraw(): void {
    this.stakingService.leaveStake(new BigNumber(this.amount.value)).subscribe(console.log);
  }

  public login(): void {
    this.walletsModalService.open().subscribe();
  }
}
