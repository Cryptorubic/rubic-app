import { ChangeDetectionStrategy, Component, OnInit, Self } from '@angular/core';
import { FormControl } from '@ngneat/reactive-forms';
import { BehaviorSubject, EMPTY, forkJoin, Observable, of } from 'rxjs';
import { finalize, map, share, switchMap, take, takeUntil, tap } from 'rxjs/operators';
import BigNumber from 'bignumber.js';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { TuiNotification } from '@taiga-ui/core';
import { TranslateService } from '@ngx-translate/core';
import { StakingService } from '@features/staking/services/staking.service';
import { NotificationsService } from '@core/services/notifications/notifications.service';
import { WalletsModalService } from '@core/wallets/services/wallets-modal.service';
import { Web3Pure } from 'rubic-sdk';

/**
 * Withdraw form component.
 */
@Component({
  selector: 'app-withdraw',
  templateUrl: './withdraw.component.html',
  styleUrls: ['./withdraw.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class WithdrawComponent implements OnInit {
  public readonly amount = new FormControl<string>('');

  public readonly needLogin$ = this.stakingService.needLogin$;

  public readonly maxAmountForWithdraw$ = this.stakingService.maxAmountForWithdraw$;

  public readonly stakingTokenBalance$ = this.stakingService.stakingTokenBalance$;

  private readonly _withdrawButtonLoading$ = new BehaviorSubject<boolean>(false);

  get withdrawButtonLoading$(): Observable<boolean> {
    return this._withdrawButtonLoading$.asObservable();
  }

  private readonly _rewardUsdPrice$ = new BehaviorSubject<BigNumber>(new BigNumber(0));

  get rewardUsdPrice$(): Observable<BigNumber> {
    return this._rewardUsdPrice$.asObservable();
  }

  public readonly canReceive$ = this.amount.valueChanges.pipe(
    switchMap(amount => {
      if (amount === '') {
        this._rewardUsdPrice$.next(new BigNumber(0));
        return of('');
      }
      const amountInWei = new BigNumber(Web3Pure.toWei(amount.split(',').join('')));
      return of(amountInWei).pipe(
        switchMap(value => this.stakingService.calculateLeaveReward(value)),
        tap(reward =>
          this._rewardUsdPrice$.next(this.stakingService.calculateBRBCUsdPrice(reward))
        ),
        map(reward => reward.toNumber())
      );
    }),
    share(),
    takeUntil(this.destroy$)
  );

  constructor(
    private readonly stakingService: StakingService,
    private readonly walletsModalService: WalletsModalService,
    private readonly notificationsService: NotificationsService,
    private readonly translateService: TranslateService,
    @Self() private readonly destroy$: TuiDestroyService
  ) {}

  public ngOnInit(): void {
    this.needLogin$
      .pipe(
        take(1),
        switchMap(needLogin => {
          if (!needLogin) {
            return forkJoin([
              this.stakingService.getStakingTokenBalance(),
              this.stakingService.getMaxAmountForWithdraw()
            ]);
          } else {
            return EMPTY;
          }
        })
      )
      .subscribe();
  }

  public withdraw(): void {
    const withdrawNotification$ = this.notificationsService.show(
      this.translateService.instant('notifications.withdrawInProgress'),
      {
        status: TuiNotification.Info,
        autoClose: false
      }
    );
    this._withdrawButtonLoading$.next(true);
    this.stakingService
      .leaveStake(new BigNumber(this.amount.value))
      .pipe(
        finalize(() => {
          withdrawNotification$.unsubscribe();
          this._withdrawButtonLoading$.next(false);
        })
      )
      .subscribe(() => {
        this.notificationsService.show(
          this.translateService.instant('notifications.successfulWithdraw'),
          {
            autoClose: 5000,
            status: TuiNotification.Success
          }
        );
      });
  }

  public login(): void {
    this.walletsModalService.open().subscribe();
  }

  public setMaxAmount(amount: BigNumber): void {
    this.amount.setValue(amount.toString());
  }
}
