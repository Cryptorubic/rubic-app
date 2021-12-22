import { ChangeDetectionStrategy, Component, Self } from '@angular/core';
import { FormControl } from '@ngneat/reactive-forms';
import { StakingService } from '@features/staking/services/staking.service';
import { finalize, map, switchMap, takeUntil } from 'rxjs/operators';
import { WalletsModalService } from '@core/wallets/services/wallets-modal.service';
import BigNumber from 'bignumber.js';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { BehaviorSubject } from 'rxjs';
import { NotificationsService } from '@core/services/notifications/notifications.service';
import { TuiNotification } from '@taiga-ui/core';

@Component({
  selector: 'app-withdraw',
  templateUrl: './withdraw.component.html',
  styleUrls: ['./withdraw.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class WithdrawComponent {
  public readonly amount = new FormControl<string>('');

  public readonly needLogin$ = this.stakingService.needLogin$;

  public readonly maxAmountForWithdraw$ = this.stakingService.maxAmountForWithdraw$;

  public readonly stakingTokenBalance$ = this.stakingService.stakingTokenBalance$;

  public readonly canReceive$ = this.amount.valueChanges.pipe(
    map(value => new BigNumber(value || 0)),
    switchMap(amount => this.stakingService.calculateLeaveReward(amount)),
    map(amount => new BigNumber(amount.toNumber() * Math.pow(10, 18))),
    takeUntil(this.destroy$)
  );

  public readonly withdrawButtonLoading$ = new BehaviorSubject<boolean>(false);

  constructor(
    private readonly stakingService: StakingService,
    private readonly walletsModalService: WalletsModalService,
    private readonly notificationsService: NotificationsService,
    @Self() private readonly destroy$: TuiDestroyService
  ) {}

  public withdraw(): void {
    this.withdrawButtonLoading$.next(true);
    this.stakingService
      .leaveStake(new BigNumber(this.amount.value))
      .pipe(finalize(() => this.withdrawButtonLoading$.next(false)))
      .subscribe(() => {
        this.notificationsService.show('Withdraw', {
          label: 'The transaction was successful',
          status: TuiNotification.Success,
          autoClose: 5000
        });
      });
  }

  public login(): void {
    this.walletsModalService.open().subscribe();
  }

  public changeNetwork(): void {}
}
