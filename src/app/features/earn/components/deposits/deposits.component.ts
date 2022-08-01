import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit
} from '@angular/core';
import { Router } from '@angular/router';
import { Deposit } from '../../models/deposit.inteface';
import { StakingService } from '../../services/staking.service';
import { filter, map, take, switchMap, takeUntil } from 'rxjs/operators';
import { TuiDestroyService, watch } from '@taiga-ui/cdk';
import { SwapFormService } from '@app/features/swaps/features/main-form/services/swap-form-service/swap-form.service';
import { NATIVE_TOKEN_ADDRESS } from '@app/shared/constants/blockchain/native-token-address';
import { BLOCKCHAIN_NAME } from 'rubic-sdk';
import { TokensService } from '@app/core/services/tokens/tokens.service';
import { compareTokens } from '@app/shared/utils/utils';
import BigNumber from 'bignumber.js';
import { SwapFormInput } from '@app/features/swaps/features/main-form/models/swap-form';
import { HeaderStore } from '@app/core/header/services/header.store';
import { ThemeService } from '@app/core/services/theme/theme.service';
import { StakingModalService } from '../../services/staking-modal.service';
import { StakingNotificationService } from '../../services/staking-notification.service';
import { DatePipe } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

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
    private readonly swapFormService: SwapFormService,
    private readonly tokensService: TokensService,
    private readonly headerStore: HeaderStore,
    private readonly themeService: ThemeService,
    private readonly stakingModalService: StakingModalService,
    private readonly stakingNotificationService: StakingNotificationService,
    @Inject(TuiDestroyService) private readonly destroy$: TuiDestroyService
  ) {}

  public ngOnInit(): void {
    this.stakingService.loadDeposits().pipe(watch(this.cdr), takeUntil(this.destroy$)).subscribe();
  }

  public async claim(deposit: Deposit): Promise<void> {
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

  public async withdraw(deposit: Deposit): Promise<void> {
    // if (Date.now() < deposit.endTimestamp) {
    if (false) {
      this.stakingNotificationService.showNftLockedError(
        new DatePipe('en-US').transform(deposit.endTimestamp, 'mediumDate')
      );
    } else {
      if (deposit.totalNftRewards.isZero()) {
        this.stakingModalService
          .showWithdrawModal(deposit.amount, this.stakingService.needSwitchNetwork$)
          .pipe(
            filter(Boolean),
            switchMap(() => {
              this._withdrawingId$.next(deposit.id);
              return this.stakingService.withdraw(deposit);
            })
          )
          .subscribe(() => this._withdrawingId$.next(''));
      } else {
        this.stakingModalService
          .showClaimModal(deposit.totalNftRewards, this.stakingService.needSwitchNetwork$)
          .pipe(
            filter(Boolean),
            switchMap(() => {
              this._withdrawingId$.next(deposit.id);
              return this.stakingService.claim(deposit);
            }),
            switchMap(() =>
              this.stakingModalService
                .showWithdrawModal(deposit.amount, this.stakingService.needSwitchNetwork$)
                .pipe(
                  filter(Boolean),
                  switchMap(() => this.stakingService.withdraw(deposit))
                )
            )
          )
          .subscribe(() => this._withdrawingId$.next(''));
      }
    }
  }

  public refreshDeposits(): void {
    this.stakingService.loadDeposits().pipe(take(1)).subscribe();
  }

  public async navigateToCcrForm(): Promise<void> {
    const form = this.swapFormService.commonTrade.controls.input;
    const from = this.tokensService.tokens.find(token =>
      compareTokens(
        {
          address: NATIVE_TOKEN_ADDRESS,
          blockchain: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN
        },
        token
      )
    );
    const to = this.tokensService.tokens.find(token =>
      compareTokens(
        {
          address: '0x8e3bcc334657560253b83f08331d85267316e08a',
          blockchain: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN
        },
        token
      )
    );
    const params = {
      fromBlockchain: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
      toBlockchain: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
      fromToken: from,
      toToken: to,
      fromAmount: new BigNumber(1)
    } as SwapFormInput;

    form.patchValue(params);

    await this.router.navigate(['/'], {
      queryParams: {
        fromChain: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
        toChain: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
        amount: '1',
        from: from,
        to: to
      },
      queryParamsHandling: 'merge'
    });

    await this.router.navigate(['/']);
  }

  public navigateToStakeForm(): void {
    this.router.navigate(['earn', 'new-position']);
  }
}
