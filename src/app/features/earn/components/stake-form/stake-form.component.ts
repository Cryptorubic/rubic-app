import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, Self } from '@angular/core';
import { Router } from '@angular/router';
import { ErrorsService } from '@app/core/errors/errors.service';
import { ERROR_TYPE } from '@app/core/errors/models/error-type';
import { RubicError } from '@app/core/errors/models/rubic-error';
import { WalletsModalService } from '@app/core/wallets-modal/services/wallets-modal.service';
import { MILLISECONDS_IN_MONTH } from '@app/shared/constants/time/time';
import { TuiDestroyService, watch } from '@taiga-ui/cdk';
import BigNumber from 'bignumber.js';
import {
  tap,
  zip,
  of,
  map,
  switchMap,
  startWith,
  from,
  catchError,
  BehaviorSubject,
  filter,
  takeUntil
} from 'rxjs';
import { StakeButtonError } from '../../models/stake-button-error.enum';
import { StakingModalService } from '../../services/staking-modal.service';
import { StakingNotificationService } from '../../services/staking-notification.service';
import { StakingService } from '../../services/staking.service';
import { FormControl } from '@angular/forms';
import { AuthService } from '@core/services/auth/auth.service';
import { HeaderStore } from '@core/header/services/header.store';

@Component({
  selector: 'app-stake-form',
  templateUrl: './stake-form.component.html',
  styleUrls: ['./stake-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class StakeFormComponent implements OnInit {
  // public readonly DURATIONS = [
  //   { value: 5, label: '5', earn: 100 },
  //   { value: 10, label: '10', earn: 120 },
  //   { value: 15, label: '15', earn: 150 },
  //   { value: 20, label: '20', earn: 200 }
  // ];
  public readonly DURATIONS = [
    { value: 3, label: '3', rewardRate: '1.0' },
    { value: 6, label: '6', rewardRate: '1.2' },
    { value: 9, label: '9', rewardRate: '1.5' },
    { value: 12, label: '12', rewardRate: '2.0' }
  ];

  public readonly MAX_LOCK_TIME = this.stakingService.MAX_LOCK_TIME;

  public readonly MIN_STAKE_AMOUNT = this.stakingService.MIN_STAKE_AMOUNT;

  public readonly rbcTokenBalance$ = this.stakingService.rbcTokenBalance$;

  public readonly durationCtrl = new FormControl(this.MAX_LOCK_TIME);

  public readonly rbcAmountCtrl = new FormControl(null);

  public readonly rbcAmount$ = this.rbcAmountCtrl.valueChanges.pipe(
    startWith(this.rbcAmountCtrl.value),
    map(value => {
      return this.stakingService.parseAmountToBn(value);
    })
  );

  public readonly rbcAllowance$ = this.stakingService.rbcAllowance$;

  public readonly needLogin$ = this.stakingService.needLogin$;

  public readonly needSwitchNetwork$ = this.stakingService.needSwitchNetwork$;

  private readonly _stakeLoading$ = new BehaviorSubject<boolean>(false);

  public readonly stakeLoading$ = this._stakeLoading$.asObservable();

  private readonly _approveLoading$ = new BehaviorSubject<boolean>(false);

  public readonly approveLoading$ = this._approveLoading$.asObservable();

  public unlockDate: number;

  public selectedDuration: number = 12;

  public selectedAmount: string;

  public rbcUsdPrice: number;

  public amountError = StakeButtonError.EMPTY_AMOUNT;

  public lockTimeExceededError = false;

  public stakingIsClosed = false;

  public readonly errors = StakeButtonError;

  public readonly isMobile = this.headerStore.isMobile;

  constructor(
    private readonly stakingService: StakingService,
    private readonly router: Router,
    private readonly walletsModalService: WalletsModalService,
    private readonly headerStore: HeaderStore,
    private readonly errorsService: ErrorsService,
    private readonly cdr: ChangeDetectorRef,
    private readonly stakingModalService: StakingModalService,
    private readonly stakingNotificationService: StakingNotificationService,
    private readonly authService: AuthService,
    @Self() private readonly destroy$: TuiDestroyService
  ) {
    this.stakingService.getRbcAmountPrice().subscribe(price => (this.rbcUsdPrice = price));
    this.authService.currentUser$.subscribe(() => this.rbcAmountCtrl.patchValue(''));
  }

  public ngOnInit(): void {
    this.handleStakeDurationChange();
    this.handleDurationError();
    this.stakingService.pollRbcTokens().pipe(takeUntil(this.destroy$)).subscribe();
  }

  public calculateUsdPrice(amount: string): string {
    return amount === ''
      ? '0.00'
      : this.stakingService.parseAmountToBn(amount).multipliedBy(this.rbcUsdPrice).toFixed(2);
  }

  public async handleErrors(rbcAmount: string): Promise<void> {
    await this.setErrors(rbcAmount);
    this.cdr.detectChanges();
  }

  public async setErrors(rbcAmount: string): Promise<void> {
    this.selectedAmount = rbcAmount;
    try {
      const isStakingStopped = await this.stakingService.isEmergencyStopped();

      if (isStakingStopped) {
        this.amountError = StakeButtonError.STAKING_CLOSED;
        this.stakingIsClosed = true;
        return;
      }
    } catch (error) {
      return;
    }

    if (rbcAmount === '') {
      this.amountError = StakeButtonError.EMPTY_AMOUNT;
      return;
    }

    if (this.stakingService.rbcTokenBalance?.lt(this.stakingService.parseAmountToBn(rbcAmount))) {
      this.amountError = StakeButtonError.INSUFFICIENT_BALANCE_RBC;
      return;
    }

    if (this.stakingService.parseAmountToBn(rbcAmount).lt(this.MIN_STAKE_AMOUNT)) {
      this.amountError = StakeButtonError.LESS_THEN_MINIMUM;
      return;
    }

    if (
      this.stakingService.rbcAllowance.isFinite() &&
      this.stakingService.rbcAllowance.lt(this.rbcAmountCtrl.value)
    ) {
      this.amountError = StakeButtonError.NEED_APPROVE;
      return;
    }

    this.amountError = StakeButtonError.NULL;
  }

  public handleDurationError(): void {
    this.lockTimeExceededError = this.MAX_LOCK_TIME < 3;
  }

  public setMaxAmount(amount: BigNumber): void {
    this.rbcAmountCtrl.patchValue(amount);
  }

  public setDuration(duration: number): void {
    this.durationCtrl.patchValue(duration);
  }

  public handleSelectedChip(value: number): boolean {
    return (
      (this.durationCtrl.value === value || value === this.selectedDuration) &&
      !this.stakingIsClosed
    );
  }

  public login(): void {
    this.walletsModalService.open().subscribe();
  }

  public async switchNetwork(): Promise<void> {
    await this.stakingService.switchNetwork();
  }

  public approve(): void {
    this._approveLoading$.next(true);

    from(this.stakingService.approveRbc()).subscribe(() => {
      this._approveLoading$.next(false);
      this.rbcAmountCtrl.patchValue(this.rbcAmountCtrl.value);
      this.cdr.detectChanges();
    });
  }

  public stake(): void {
    const amount =
      typeof this.rbcAmountCtrl.value !== 'string'
        ? this.rbcAmountCtrl.value
        : new BigNumber(this.rbcAmountCtrl.value.replaceAll(',', ''));
    const duration = this.durationCtrl.value;

    this.stakingModalService
      .showDepositModal(amount, duration, this.unlockDate)
      .pipe(
        filter(Boolean),
        switchMap(() => {
          this._stakeLoading$.next(true);
          return from(this.stakingService.stake(amount, duration)).pipe(
            switchMap(() => {
              return this.stakingService.getRbcTokenBalance();
            }),
            catchError((error: unknown) => {
              this.errorsService.catch(error as RubicError<ERROR_TYPE.TEXT>);
              return of(null);
            }),
            watch(this.cdr)
          );
        })
      )
      .subscribe(result => {
        this._stakeLoading$.next(false);

        if (result) {
          this.stakingNotificationService.showSuccessDepositNotification();
          this.back();
        }
      });
  }

  private handleStakeDurationChange(): void {
    this.durationCtrl.valueChanges
      .pipe(
        startWith(this.durationCtrl.value),
        switchMap(duration => {
          return zip(of(duration), this.stakingService.getCurrentTimeInSeconds());
        }),
        tap(([duration, blockTimestamp]) => {
          this.selectedDuration = duration;
          this.unlockDate = this.calculateUnlockDateTimestamp(blockTimestamp, duration);
        }),
        watch(this.cdr),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  public back(): void {
    this.router.navigate(['/staking']);
  }

  private calculateUnlockDateTimestamp(blockTimestamp: number, duration: number): number {
    return Math.trunc(blockTimestamp * 1000 + duration * MILLISECONDS_IN_MONTH);
  }
}
