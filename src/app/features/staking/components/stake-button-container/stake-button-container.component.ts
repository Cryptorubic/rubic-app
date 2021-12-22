import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  Self
} from '@angular/core';
import { STAKE_LIMIT_MAX, STAKE_LIMIT_MIN } from '../../constants/STACKING_LIMITS';
import BigNumber from 'bignumber.js';
import { BehaviorSubject, combineLatest, from, of, zip } from 'rxjs';

import { ErrorTypeEnum } from '../../enums/error-type.enum';
import { StakingService } from '@features/staking/services/staking.service';
import { map, switchMap, take, takeUntil, tap, withLatestFrom } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/BLOCKCHAIN_NAME';
import { WalletConnectorService } from '@core/services/blockchain/wallets/wallet-connector-service/wallet-connector.service';

@Component({
  selector: 'app-stake-button-container',
  templateUrl: './stake-button-container.component.html',
  styleUrls: ['./stake-button-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class StakeButtonContainerComponent implements OnInit {
  public readonly needLogin$ = this.stakingService.needLogin$;

  public readonly selectedTokenBalance$ = this.stakingService.selectedTokenBalance$;

  public readonly userEnteredAmount$ = this.stakingService.userEnteredAmount$;

  public readonly limit$ = combineLatest([
    this.stakingService.selectedToken$,
    this.stakingService.userEnteredAmount$
  ]).pipe(
    map(([token, userEnteredAmount]) => {
      const max = new BigNumber(STAKE_LIMIT_MAX[token.blockchain as keyof typeof STAKE_LIMIT_MAX])
        .minus(new BigNumber(userEnteredAmount))
        .toNumber();
      const min = STAKE_LIMIT_MIN[token.blockchain as keyof typeof STAKE_LIMIT_MIN];

      return { max, min };
    })
  );

  @Input() approvedTokens: boolean;

  @Input() amountFormControl: FormControl;

  @Input() loading: boolean;

  @Output() onConfirmStake = new EventEmitter<void>();

  @Output() onLogin = new EventEmitter<void>();

  @Output() onApprove = new EventEmitter<void>();

  public needApprove$ = new BehaviorSubject<boolean>(true);

  public needChangeNetwork$ = combineLatest([
    this.stakingService.selectedToken$,
    this.walletConnectorService.networkChange$
  ]).pipe(
    map(([selectedToken]) => selectedToken.blockchain !== this?.walletConnectorService?.networkName)
  );

  public readonly errorType$ = new BehaviorSubject<ErrorTypeEnum | null>(
    ErrorTypeEnum.EMPTY_AMOUNT
  );

  public readonly errorTypeEnum = ErrorTypeEnum;

  private readonly selectedToken$ = this.stakingService.selectedToken$;

  constructor(
    private stakingService: StakingService,
    private walletConnectorService: WalletConnectorService,
    @Self() private readonly destroy$: TuiDestroyService
  ) {}

  public ngOnInit(): void {
    this.amountFormControl.valueChanges
      .pipe(
        withLatestFrom(this.selectedTokenBalance$, this.limit$),
        map(([amount, balance]) => [
          new BigNumber(amount ? amount.split(',').join('') : NaN),
          balance
        ]),
        tap(([amount, balance, limit]) => this.checkAmountAndBalance(amount, balance, limit)),
        withLatestFrom(this.selectedToken$),
        switchMap(([[amount, balance, limit], selectedToken]) => {
          return zip(
            selectedToken.blockchain !== BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN
              ? of(false)
              : this.stakingService.needApprove(amount),
            of(balance),
            of(limit),
            of(amount)
          );
        }),
        tap(([needApprove, balance, limit, amount]) => {
          this.needApprove$.next(needApprove);
          this.checkAmountAndBalance(amount, balance, limit);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  public switchNetwork(): void {
    this.selectedToken$
      .pipe(
        take(1),
        switchMap(({ blockchain }) => {
          return from(this.walletConnectorService.switchChain(blockchain));
        })
      )
      .subscribe();
  }

  public onStake(needApprove: boolean): void {
    if (needApprove) {
      this.onApprove.emit();
    } else {
      this.onConfirmStake.emit();
    }
  }

  private checkAmountAndBalance(amount: BigNumber, balance: BigNumber, limit: BigNumber): void {
    if (amount.isNaN()) {
      this.errorType$.next(ErrorTypeEnum.EMPTY_AMOUNT);
      return;
    }

    if (balance.lt(amount)) {
      this.errorType$.next(ErrorTypeEnum.INSUFFICIENT_BALANCE);
      return;
    }

    if (
      amount.gt(limit) ||
      amount.lt(
        new BigNumber(
          STAKE_LIMIT_MIN[
            this.stakingService.selectedToken.blockchain as keyof typeof STAKE_LIMIT_MIN
          ]
        )
      )
    ) {
      this.errorType$.next(ErrorTypeEnum.LIMIT);
      return;
    } else {
      this.errorType$.next(null);
      return;
    }
  }
}
