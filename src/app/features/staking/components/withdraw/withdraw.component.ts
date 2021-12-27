import { ChangeDetectionStrategy, Component, OnInit, Self } from '@angular/core';
import { FormControl } from '@ngneat/reactive-forms';
import { StakingService } from '@features/staking/services/staking.service';
import { finalize, map, switchMap, take, takeUntil } from 'rxjs/operators';
import { WalletsModalService } from '@core/wallets/services/wallets-modal.service';
import BigNumber from 'bignumber.js';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { BehaviorSubject, EMPTY, forkJoin, of } from 'rxjs';
import { NotificationsService } from '@core/services/notifications/notifications.service';
import { TuiNotification } from '@taiga-ui/core';
import { TranslateService } from '@ngx-translate/core';
import { Web3Pure } from '@core/services/blockchain/blockchain-adapters/common/web3-pure';

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

  public readonly canReceive$ = this.amount.valueChanges.pipe(
    switchMap(amount => {
      if (amount === '') {
        return of('');
      }      
      return of(
        new BigNumber(EthLikeWeb3Public.toWei(new BigNumber(amount.split(',').join(''))))
      ).pipe(
        switchMap(x => this.stakingService.calculateLeaveReward(x)),
        map(x => x.toNumber())
      );
    }),
    takeUntil(this.destroy$)
  );

  public readonly withdrawButtonLoading$ = new BehaviorSubject<boolean>(false);

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
    this.withdrawButtonLoading$.next(true);
    this.stakingService
      .leaveStake(new BigNumber(this.amount.value))
      .pipe(
        finalize(() => {
          withdrawNotification$.unsubscribe();
          this.withdrawButtonLoading$.next(false);
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
