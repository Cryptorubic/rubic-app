import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  Self
} from '@angular/core';
import {
  STAKE_LIMIT_MAX,
  STAKE_LIMIT_MAX_WHITELIST,
  STAKE_LIMIT_MIN,
  STAKE_LIMIT_MIN_WHITELIST
} from '@app/features/staking/constants/STAKING_LIMITS';
import BigNumber from 'bignumber.js';
import { ErrorType } from '../../enums/error-type.enum';
import { StakingService } from '@features/staking/services/staking.service';
import { BehaviorSubject, combineLatest, from, Observable, of, zip } from 'rxjs';
import {
  map,
  pluck,
  startWith,
  switchMap,
  take,
  takeUntil,
  tap,
  withLatestFrom
} from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';
import { WalletConnectorService } from '@core/services/blockchain/wallets/wallet-connector-service/wallet-connector.service';

type Limits = { max: number; min: number; maxWhitelist: number; minWhitelist: number };

/**
 * Stake button container component, contains logic of entering stake,
 * connecting wallet, changing network and validation of entered staking amount.
 */
@Component({
  selector: 'app-stake-button-container',
  templateUrl: './stake-button-container.component.html',
  styleUrls: ['./stake-button-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class StakeButtonContainerComponent implements OnInit {
  /**
   * Does user have approved tokens or not.
   */
  @Input() approvedTokens: boolean;

  /**
   * Form control for amount of token user wants to stake.
   */
  @Input() amountFormControl: FormControl;

  /**
   * Loading state for button "Confirm stake" button.
   */
  @Input() loading: boolean;

  /**
   * Loading state for button "Confirm stake with whitelist" button.
   */
  @Input() whitelistStakeLoading: boolean;

  /**
   * Emits event on entering stake.
   */
  @Output() onConfirmStake = new EventEmitter<boolean>();

  /**
   * Emits event on connecting wallet.
   */
  @Output() onLogin = new EventEmitter<void>();

  /**
   * Emits event on approving tokens.
   */
  @Output() onApprove = new EventEmitter<void>();

  public readonly needLogin$ = this.stakingService.needLogin$;

  public readonly selectedTokenBalance$ = this.stakingService.selectedTokenBalance$;

  public readonly userEnteredAmount$ = this.stakingService.userEnteredAmount$;

  public readonly isUserWhitelisted$ = this.stakingService.isUserWhitelisted$;

  public readonly isUserWhitelisted = this.stakingService.isUserWhitelisted;

  public readonly isNotFirstStakingRound = this.stakingService.stakingRound !== 1;

  public readonly isBridgeTokenSelected$ = this.stakingService.selectedToken$.pipe(
    pluck('blockchain'),
    map(blockchain => blockchain !== BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN)
  );

  public readonly limit$ = combineLatest([
    this.stakingService.selectedToken$,
    this.stakingService.userEnteredAmount$,
    this.stakingService.whitelistUserEnteredAmount$
  ]).pipe(
    map(([token, userEnteredAmount, whitelistUserEnteredAmount]) => {
      const max = new BigNumber(STAKE_LIMIT_MAX[token.blockchain as keyof typeof STAKE_LIMIT_MAX])
        .minus(new BigNumber(userEnteredAmount))
        .toNumber();
      const min = STAKE_LIMIT_MIN[token.blockchain as keyof typeof STAKE_LIMIT_MIN];

      const maxWhitelist = new BigNumber(
        STAKE_LIMIT_MAX_WHITELIST[token.blockchain as keyof typeof STAKE_LIMIT_MAX]
      )
        .minus(new BigNumber(whitelistUserEnteredAmount))
        .toNumber();
      const minWhitelist =
        STAKE_LIMIT_MIN_WHITELIST[token.blockchain as keyof typeof STAKE_LIMIT_MIN];

      return { max, min, maxWhitelist, minWhitelist };
    })
  );

  private readonly _needApprove$ = new BehaviorSubject<boolean>(true);

  get needApprove$(): Observable<boolean> {
    return this._needApprove$.asObservable();
  }

  public readonly selectedTokenBlockchain$ = this.stakingService.selectedToken$.pipe(
    pluck('blockchain')
  );

  public readonly needChangeNetwork$ = combineLatest([
    this.stakingService.selectedToken$,
    this.walletConnectorService.networkChange$
  ]).pipe(
    map(([selectedToken]) => selectedToken.blockchain !== this?.walletConnectorService?.networkName)
  );

  private readonly _errorType$ = new BehaviorSubject<ErrorType | null>(ErrorType.EMPTY_AMOUNT);

  public readonly errorType$ = this._errorType$.asObservable();

  private readonly _errorTypeWhitelist$ = new BehaviorSubject<ErrorType | null>(
    ErrorType.EMPTY_AMOUNT
  );

  public readonly errorTypeWhitelist$ = this._errorTypeWhitelist$.asObservable();

  public readonly errorTypeEnum = ErrorType;

  private readonly selectedToken$ = this.stakingService.selectedToken$;

  constructor(
    private readonly stakingService: StakingService,
    private readonly walletConnectorService: WalletConnectorService,
    @Self() private readonly destroy$: TuiDestroyService
  ) {}

  public ngOnInit(): void {
    this.amountFormControl.valueChanges
      .pipe(
        startWith(this.amountFormControl.value),
        withLatestFrom(this.selectedTokenBalance$, this.limit$),
        map(([amount, balance, limit]) => {
          const adjustedAmount = new BigNumber(amount ? amount.split(',').join('') : NaN);

          return [adjustedAmount, balance, limit];
        }),
        tap(([amount, balance, limit]) => {
          this.checkAmountAndBalance(amount as BigNumber, balance as BigNumber, limit as Limits);
          if (this.isUserWhitelisted) {
            this.checkAmountAndBalanceWhitelist(
              amount as BigNumber,
              balance as BigNumber,
              limit as Limits
            );
          }
        }),
        withLatestFrom(this.selectedToken$),
        switchMap(([[amount, balance, limit], selectedToken]) => {
          return zip(
            selectedToken.blockchain !== BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN
              ? of(false)
              : this.stakingService.needApprove(amount as BigNumber),
            of(balance),
            of(limit),
            of(amount)
          );
        }),
        tap(([needApprove, balance, limit, amount]) => {
          this._needApprove$.next(needApprove);
          this.checkAmountAndBalance(amount as BigNumber, balance as BigNumber, limit as Limits);

          if (this.stakingService.isUserWhitelisted) {
            this.checkAmountAndBalanceWhitelist(
              amount as BigNumber,
              balance as BigNumber,
              limit as Limits
            );
          }
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

  public onStake(needApprove: boolean, whitelist = false): void {
    if (needApprove) {
      this.onApprove.emit();
    } else {
      this.onConfirmStake.emit(whitelist);
    }
  }

  private checkAmountAndBalanceWhitelist(
    amount: BigNumber,
    balance: BigNumber,
    limit: Limits
  ): void {
    if (!amount.isFinite()) {
      this._errorTypeWhitelist$.next(ErrorType.EMPTY_AMOUNT);
      return;
    }

    if (balance.lt(amount)) {
      this._errorTypeWhitelist$.next(ErrorType.INSUFFICIENT_BALANCE);
      return;
    }

    if (amount.gt(limit.maxWhitelist) || amount.lt(limit.minWhitelist)) {
      this._errorTypeWhitelist$.next(ErrorType.LIMIT);
      return;
    } else {
      this._errorTypeWhitelist$.next(null);
      return;
    }
  }

  private checkAmountAndBalance(amount: BigNumber, balance: BigNumber, limit: Limits): void {
    if (limit.max === 0) {
      this._errorType$.next(ErrorType.LIMIT_REACHED);
      return;
    }

    if (!amount.isFinite()) {
      this._errorType$.next(ErrorType.EMPTY_AMOUNT);
      return;
    }

    if (balance.lt(amount)) {
      this._errorType$.next(ErrorType.INSUFFICIENT_BALANCE);
      return;
    }

    if (
      amount.gt(limit.max) ||
      amount.lt(
        new BigNumber(
          STAKE_LIMIT_MIN[
            this.stakingService.selectedToken.blockchain as keyof typeof STAKE_LIMIT_MIN
          ]
        )
      )
    ) {
      this._errorType$.next(ErrorType.LIMIT);
      return;
    } else {
      this._errorType$.next(null);
      return;
    }
  }
}
