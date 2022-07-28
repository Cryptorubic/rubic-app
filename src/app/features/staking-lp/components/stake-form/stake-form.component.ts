import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ErrorsService } from '@app/core/errors/errors.service';
import { ERROR_TYPE } from '@app/core/errors/models/error-type';
import { RubicError } from '@app/core/errors/models/rubic-error';
import { WalletsModalService } from '@app/core/wallets/services/wallets-modal.service';
import { FormControl } from '@ngneat/reactive-forms';
import { watch } from '@taiga-ui/cdk';
import BigNumber from 'bignumber.js';
import { zip, of, debounceTime, map, switchMap, filter, startWith, from, catchError } from 'rxjs';
import { StakingService } from '../../services/staking.service';

const MONTH_TIMESTAMP = 2592000000;

@Component({
  selector: 'app-stake-form',
  templateUrl: './stake-form.component.html',
  styleUrls: ['./stake-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StakeFormComponent implements OnInit {
  public readonly DURATIONS = [
    { value: 1, label: '1M' },
    { value: 6, label: '6M' },
    { value: 12, label: '12M' }
  ];

  public readonly rbcTokenBalance$ = this.stakingService.rbcTokenBalance$;

  public readonly durationSliderCtrl = new FormControl(6);

  public readonly rbcAmountCtrl = new FormControl(null);

  public readonly rbcAmount$ = this.rbcAmountCtrl.valueChanges.pipe(
    map(value => {
      if (value) {
        return new BigNumber(String(value).split(',').join(''));
      } else {
        return new BigNumber(NaN);
      }
    })
  );

  public readonly rbcAllowance$ = this.stakingService.rbcAllowance$;

  public readonly usdAmount$ = this.rbcAmount$.pipe(
    debounceTime(500),
    switchMap((amount: BigNumber) => this.stakingService.getRbcAmountPrice(amount)),
    map(amount => amount.toNumber())
  );

  public readonly needLogin$ = this.stakingService.needLogin$;

  public readonly needSwitchNetwork$ = this.stakingService.needSwitchNetwork$;

  public approveLoading = false;

  public stakeLoading = false;

  public unlockDate: number;

  constructor(
    private readonly stakingService: StakingService,
    private readonly router: Router,
    private readonly walletsModalService: WalletsModalService,
    private readonly errorsService: ErrorsService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.stakingService.user$
      .pipe(
        filter(user => Boolean(user?.address)),
        switchMap(() => this.stakingService.getAllowance()),
        switchMap(() => this.stakingService.getRbcTokenBalance())
      )
      .subscribe();

    this.durationSliderCtrl.valueChanges
      .pipe(
        startWith(this.durationSliderCtrl.value),
        switchMap(duration => {
          return zip(of(duration), this.stakingService.getCurrentTime());
        })
      )
      .subscribe(([duration, timestamp]) => {
        this.unlockDate =
          ((timestamp + duration * MONTH_TIMESTAMP) / MONTH_TIMESTAMP) * MONTH_TIMESTAMP;
      });
  }

  public setMaxAmount(amount: BigNumber): void {
    this.rbcAmountCtrl.patchValue(amount.toFixed(2));
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
    this.approveLoading = true;
    from(this.stakingService.approveRbc())
      .pipe(
        catchError((error: unknown) => {
          this.errorsService.catch(error as RubicError<ERROR_TYPE.TEXT>);
          return of(null);
        }),
        switchMap(receipt => {
          this.approveLoading = false;
          if (receipt && receipt.status) {
            this.stakingService.showSuccessApproveNotification();
          }
          return this.stakingService.getAllowance();
        }),
        watch(this.cdr)
      )
      .subscribe(() => {
        this.approveLoading = false;
      });
  }

  public async stake(): Promise<void> {
    this.stakeLoading = true;
    const duration = this.durationSliderCtrl.value;
    const amount = this.rbcAmountCtrl.value;
    console.log({ duration, amount });

    try {
      const stakeTx = await this.stakingService.stake(amount, duration);
      if (stakeTx.status) {
        this.stakingService.showSuccessDepositNotification();
        this.stakingService.getRbcTokenBalance().subscribe();
        this.rbcAmountCtrl.patchValue(null);
      }
    } catch (error) {
      this.errorsService.catchAnyError(error);
    } finally {
      this.stakeLoading = false;
    }
  }

  public back(): void {
    this.router.navigate(['/staking-lp']);
  }
}
