import { ChangeDetectionStrategy, Component, Self } from '@angular/core';
import { FormControl } from '@ngneat/reactive-forms';
import { StakingService } from '@features/staking/services/staking.service';
import { map, startWith, switchMap, takeUntil } from 'rxjs/operators';
import { WalletsModalService } from '@core/wallets/services/wallets-modal.service';
import BigNumber from 'bignumber.js';
import { TuiDestroyService } from '@taiga-ui/cdk';

@Component({
  selector: 'app-withdraw',
  templateUrl: './withdraw.component.html',
  styleUrls: ['./withdraw.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class WithdrawComponent {
  public readonly DEFAULT_DECIMALS = 18;

  public readonly amount = new FormControl<string>('');

  public readonly needLogin$ = this.stakingService.needLogin$;

  public readonly stakingTokenBalance$ = this.stakingService.stakingTokenBalance$;

  public readonly canReceive$ = this.amount.valueChanges.pipe(
    startWith(this.amount.value),
    map(value => (value ? new BigNumber(value.split(',').join('')) : new BigNumber(0))),
    switchMap(amount => this.stakingService.calculateLeaveReward(amount)),
    takeUntil(this.destroy$)
  );

  constructor(
    private readonly stakingService: StakingService,
    private readonly walletsModalService: WalletsModalService,
    @Self() private readonly destroy$: TuiDestroyService
  ) {}

  public withdraw(): void {
    this.stakingService.leaveStake(new BigNumber(this.amount.value)).subscribe(console.log);
  }

  public login(): void {
    this.walletsModalService.open().subscribe();
  }

  public changeNetwork(): void {}
}
