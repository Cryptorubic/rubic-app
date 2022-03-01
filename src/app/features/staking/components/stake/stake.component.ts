import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Self } from '@angular/core';
import { TuiNotification } from '@taiga-ui/core';
import { FormControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { TuiDestroyService } from '@taiga-ui/cdk';
import BigNumber from 'bignumber.js';
import { BehaviorSubject, Observable } from 'rxjs';
import { finalize, switchMap, takeUntil } from 'rxjs/operators';
import { StakingService } from '../../services/staking.service';
import { WalletsModalService } from '@app/core/wallets/services/wallets-modal.service';
import { NotificationsService } from '@core/services/notifications/notifications.service';
import { STAKING_TOKENS } from '@app/features/staking/constants/STAKING_TOKENS';

/**
 * Stake form component.
 */
@Component({
  selector: 'app-stake',
  templateUrl: './stake.component.html',
  styleUrls: ['./stake.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class StakeComponent {
  public readonly needLogin$ = this.stakingService.needLogin$;

  public readonly amount = new FormControl('');

  public readonly token = new FormControl(STAKING_TOKENS[0]);

  public readonly selectedToken$ = this.stakingService.selectedToken$;

  public readonly selectedTokenBalance$ = this.stakingService.selectedTokenBalance$;

  public readonly userEnteredAmount$ = this.stakingService.userEnteredAmount$;

  public readonly needApprove$ = this.amount.valueChanges.pipe(
    switchMap(amount => this.stakingService.needApprove(new BigNumber(amount.split(',').join('')))),
    // tap(needApprove => (this.approvedTokens = needApprove)),
    takeUntil(this.destroy$)
  );

  private readonly _stakeButtonLoading$ = new BehaviorSubject(false);

  get stakeButtonLoading$(): Observable<boolean> {
    return this._stakeButtonLoading$.asObservable();
  }

  private readonly _whitelistStakeButtonLoading$ = new BehaviorSubject(false);

  get whitelistStakeButtonLoading$(): Observable<boolean> {
    return this._whitelistStakeButtonLoading$.asObservable();
  }

  public approvedTokens: boolean = false;

  constructor(
    private readonly stakingService: StakingService,
    private readonly walletsModalService: WalletsModalService,
    private readonly notificationsService: NotificationsService,
    private readonly translateService: TranslateService,
    private readonly cdr: ChangeDetectorRef,
    @Self() private readonly destroy$: TuiDestroyService
  ) {}

  public confirmStake(viaWhitelist: boolean): void {
    if (viaWhitelist) {
      this._whitelistStakeButtonLoading$.next(true);
    } else {
      this._stakeButtonLoading$.next(true);
    }

    this.stakingService
      .enterStake(new BigNumber(this.amount.value.split(',').join('')), viaWhitelist)
      .pipe(
        finalize(() => {
          this._whitelistStakeButtonLoading$.next(false);
          this._stakeButtonLoading$.next(false);
          this.cdr.detectChanges();
        })
      )
      .subscribe(result => {
        this.amount.reset();
        if (typeof result !== 'boolean') {
          this.notificationsService.show(
            this.translateService.instant('notifications.successfulStake'),
            {
              status: TuiNotification.Success,
              autoClose: 5000
            }
          );
        }
      });
  }

  public login(): void {
    this.walletsModalService.open().subscribe();
  }

  public approve(): void {
    this._stakeButtonLoading$.next(true);
    const approveNotification = this.notificationsService.show(
      this.translateService.instant('notifications.approveInProgress'),
      {
        status: TuiNotification.Info,
        autoClose: false
      }
    );
    this.stakingService
      .approveTokens()
      .pipe(
        finalize(() => {
          approveNotification.unsubscribe();
          this._stakeButtonLoading$.next(false);
        })
      )
      .subscribe(() => {
        this.approvedTokens = true;
        this.notificationsService.show(
          this.translateService.instant('notifications.successApprove'),
          {
            status: TuiNotification.Success,
            autoClose: 5000
          }
        );
        this.amount.patchValue(this.amount.value);
        this.cdr.detectChanges();
      });
  }

  public setMaxAmount(amount: BigNumber): void {
    this.amount.setValue(amount.toString());
  }
}
