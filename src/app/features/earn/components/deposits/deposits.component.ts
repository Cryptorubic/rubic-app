import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
  Self
} from '@angular/core';
import { Router } from '@angular/router';
import { Deposit } from '../../models/deposit.inteface';
import { StakingService } from '../../services/staking.service';
import { filter, map, take, switchMap, takeUntil } from 'rxjs/operators';
import { TuiDestroyService, watch } from '@taiga-ui/cdk';
import { HeaderStore } from '@app/core/header/services/header.store';
import { ThemeService } from '@app/core/services/theme/theme.service';
import { StakingModalService } from '../../services/staking-modal.service';
import { StakingNotificationService } from '../../services/staking-notification.service';
import { DatePipe } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { WINDOW } from '@ng-web-apis/common';

@Component({
  selector: 'app-deposits',
  templateUrl: './deposits.component.html',
  styleUrls: ['./deposits.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class DepositsComponent implements OnInit {
  public readonly deposits$ = this.stakingService.deposits$;

  public readonly depositsLoading$ = this.stakingService.depositsLoading$;

  public readonly total$ = this.stakingService.total$;

  public readonly isDarkTheme$ = this.themeService.theme$.pipe(map(theme => theme === 'dark'));

  public readonly isMobile = this.headerStore.isMobile;

  private readonly _claimingId$ = new BehaviorSubject<string>('');

  public readonly claimingId$ = this._claimingId$.asObservable();

  private readonly _withdrawingId$ = new BehaviorSubject<string>('');

  public readonly withdrawingId$ = this._withdrawingId$.asObservable();

  constructor(
    private readonly router: Router,
    private readonly stakingService: StakingService,
    private readonly cdr: ChangeDetectorRef,
    private readonly headerStore: HeaderStore,
    private readonly themeService: ThemeService,
    private readonly stakingModalService: StakingModalService,
    private readonly stakingNotificationService: StakingNotificationService,
    @Inject(WINDOW) private readonly window: Window,
    @Self() private readonly destroy$: TuiDestroyService
  ) {}

  public ngOnInit(): void {
    this.stakingService.loadDeposits().pipe(watch(this.cdr), takeUntil(this.destroy$)).subscribe();
  }

  public async startClaim(deposit: Deposit): Promise<void> {
    this.stakingModalService
      .showClaimModal(deposit.totalNftRewards, this.stakingService.needSwitchNetwork$)
      .pipe(
        filter(Boolean),
        switchMap(() => {
          this._claimingId$.next(deposit.id);
          return this.stakingService.claim(deposit);
        })
      )
      .subscribe(() => {
        this._claimingId$.next('');
      });
  }

  public async startWithdraw(deposit: Deposit): Promise<void> {
    if (Date.now() > deposit.endTimestamp || (await this.stakingService.isEmergencyStopped())) {
      this.withdraw(deposit);
    } else {
      this.stakingNotificationService.showNftLockedError(
        new DatePipe('en-US').transform(deposit.endTimestamp, 'mediumDate')
      );
    }
  }

  private withdraw(deposit: Deposit): void {
    this.stakingModalService
      .showWithdrawModal(
        deposit.amount,
        this.stakingService.needSwitchNetwork$,
        deposit?.totalNftRewards
      )
      .pipe(
        filter(Boolean),
        switchMap(() => {
          this._withdrawingId$.next(deposit.id);
          return this.stakingService.withdraw(deposit);
        })
      )
      .subscribe(() => this._withdrawingId$.next(''));
  }

  public refreshDeposits(): void {
    this.stakingService.loadDeposits().pipe(take(1)).subscribe();
  }

  public async navigateToCcrForm(): Promise<void> {
    const url = this.router.serializeUrl(
      this.router.createUrlTree(['/'], {
        queryParams: {
          from: 'USDT',
          to: 'USDT',
          fromChain: 'BSC',
          toChain: 'ETH',
          amount: 100
        }
      })
    );

    this.window.open(url, '_blank');
  }

  public navigateToStakeForm(): void {
    this.router.navigate(['staking', 'new-position']);
  }
}
