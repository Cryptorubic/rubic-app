import { ChangeDetectionStrategy, Component, Inject, Injector, Self } from '@angular/core';
import { TuiDialogService, TuiNotification } from '@taiga-ui/core';
import { FormControl } from '@angular/forms';

import { StakingService } from '../../services/staking.service';
import { STAKING_TOKENS } from '../../constants/STAKING_TOKENS';
import { TuiDestroyService } from '@taiga-ui/cdk';
import BigNumber from 'bignumber.js';
import { WalletsModalService } from '@app/core/wallets/services/wallets-modal.service';
import { BehaviorSubject } from 'rxjs';
import { finalize, switchMap, takeUntil } from 'rxjs/operators';
import { NotificationsService } from '@core/services/notifications/notifications.service';

@Component({
  selector: 'app-stake',
  templateUrl: './stake.component.html',
  styleUrls: ['./stake.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class StakeComponent {
  public readonly loading$ = new BehaviorSubject<boolean>(false);

  public readonly needLogin$ = this.stakingService.needLogin$;

  public readonly amount = new FormControl('');

  public readonly token = new FormControl(STAKING_TOKENS[0]);

  public readonly selectedToken$ = this.stakingService.selectedToken$;

  public readonly selectedTokenBalance$ = this.stakingService.selectedTokenBalance$;

  public readonly userEnteredAmount$ = this.stakingService.userEnteredAmount$;

  public readonly needApprove$ = this.amount.valueChanges.pipe(
    switchMap(amount => this.stakingService.needApprove(new BigNumber(amount.split(',').join('')))),
    takeUntil(this.destroy$)
  );

  public readonly stakeButtonLoading$ = new BehaviorSubject(false);

  constructor(
    @Inject(TuiDialogService) private readonly dialogService: TuiDialogService,
    @Inject(Injector) private readonly injector: Injector,
    @Self() private readonly destroy$: TuiDestroyService,
    private readonly stakingService: StakingService,
    private readonly walletsModalService: WalletsModalService,
    private readonly notificationsService: NotificationsService
  ) {}

  public confirmStake(): void {
    this.stakeButtonLoading$.next(true);
    this.stakingService
      .enterStake(new BigNumber(this.amount.value.split(',').join('')))
      .pipe(
        finalize(() => {
          this.stakeButtonLoading$.next(false);
        })
      )
      .subscribe(() => {
        this.amount.reset();
        this.notificationsService.show('Staking', {
          label: 'The transaction was successful',
          status: TuiNotification.Success,
          autoClose: 5000
        });
      });
  }

  public login(): void {
    this.walletsModalService.open().subscribe();
  }

  public approve(): void {
    this.stakeButtonLoading$.next(true);
    this.stakingService
      .approveTokens()
      .pipe(finalize(() => this.stakeButtonLoading$.next(false)))
      .subscribe(() => {
        this.notificationsService.show('Tokens approve', {
          label: 'The transaction was successful',
          status: TuiNotification.Success,
          autoClose: 5000
        });
      });
  }

  public setMaxAmount(amount: BigNumber): void {
    this.amount.setValue(amount.toString());
  }
}
