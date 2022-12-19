import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit
} from '@angular/core';
import { Router } from '@angular/router';
import { ErrorsService } from '@app/core/errors/errors.service';
import { ERROR_TYPE } from '@app/core/errors/models/error-type';
import { RubicError } from '@app/core/errors/models/rubic-error';
import { WalletsModalService } from '@app/core/wallets-modal/services/wallets-modal.service';
import { MILLISECONDS_IN_MONTH, MILLISECONDS_IN_WEEK } from '@app/shared/constants/time/time';
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

@Component({
  selector: 'app-stake-form',
  templateUrl: './stake-form.component.html',
  styleUrls: ['./stake-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class StakeFormComponent implements OnInit {
  public readonly DURATIONS = [
    { value: 1, label: '1M' },
    { value: 6, label: '6M' },
    { value: 12, label: '12M' }
  ];

  public readonly MAX_LOCK_TIME = this.stakingService.MAX_LOCK_TIME;

  public readonly MIN_STAKE_AMOUNT = this.stakingService.MIN_STAKE_AMOUNT;

  public readonly rbcTokenBalance$ = this.stakingService.rbcTokenBalance$;

  public readonly durationSliderCtrl = new FormControl(this.MAX_LOCK_TIME);

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

  public selectedDuration: number = 6;

  public selectedAmount: string;

  public rbcUsdPrice: number;

  public amountError = StakeButtonError.EMPTY_AMOUNT;

  public lockTimeExceededError = false;

  public readonly errors = StakeButtonError;

  constructor(
    private readonly stakingService: StakingService,
    private readonly router: Router,
    private readonly walletsModalService: WalletsModalService,
    private readonly errorsService: ErrorsService,
    private readonly cdr: ChangeDetectorRef,
    private readonly stakingModalService: StakingModalService,
    private readonly stakingNotificationService: StakingNotificationService,
    @Inject(TuiDestroyService) private readonly destroy$: TuiDestroyService
  ) {
    this.stakingService.getRbcAmountPrice().subscribe(price => (this.rbcUsdPrice = price));
  }

  public ngOnInit(): void {
    this.handleStakeDurationChange();
    this.stakingService.pollRbcTokens().pipe(takeUntil(this.destroy$)).subscribe();
  }

  public calculateUsdPrice(amount: string): string {
    return amount === ''
      ? '0.00'
      : this.stakingService.parseAmountToBn(amount).multipliedBy(this.rbcUsdPrice).toFixed(2);
  }

  public handleErrors(rbcAmount: string): void {
    this.selectedAmount = rbcAmount;

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
      this.stakingService.rbcAllowance.lt(10000000)
    ) {
      this.amountError = StakeButtonError.NEED_APPROVE;
      return;
    }

    this.amountError = StakeButtonError.NULL;
  }

  public handleDurationError(duration: number): void {
    this.lockTimeExceededError = duration > this.MAX_LOCK_TIME;
  }

  public setMaxAmount(amount: BigNumber): void {
    this.rbcAmountCtrl.patchValue(amount);
  }

  public setDuration(duration: number): void {
    this.durationSliderCtrl.patchValue(duration);
  }

  public login(): void {
    this.walletsModalService.open().subscribe();
  }

  public async switchNetwork(): Promise<void> {
    this.stakingService.switchNetwork();
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
    const duration = this.durationSliderCtrl.value;

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
    this.durationSliderCtrl.valueChanges
      .pipe(
        startWith(this.durationSliderCtrl.value),
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
    return (
      Math.trunc(
        (blockTimestamp * 1000 + duration * MILLISECONDS_IN_MONTH) / MILLISECONDS_IN_WEEK
      ) * MILLISECONDS_IN_WEEK
    );
  }
}
