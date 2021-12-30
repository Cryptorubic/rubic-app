import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  Self
} from '@angular/core';
import BigNumber from 'bignumber.js';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, takeUntil, tap, withLatestFrom } from 'rxjs/operators';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { FormControl } from '@angular/forms';
import { StakingService } from '@features/staking/services/staking.service';
import { WalletConnectorService } from '@core/services/blockchain/wallets/wallet-connector-service/wallet-connector.service';
import { ErrorTypeEnum } from '../../enums/error-type.enum';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';

/**
 * Withdraw button container component. Contains logic of leaving stake,
 * connecting wallet, changing network and validation of entered withdraw amount.
 */
@Component({
  selector: 'app-withdraw-button-container',
  templateUrl: './withdraw-button-container.component.html',
  styleUrls: ['./withdraw-button-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class WithdrawButtonContainerComponent implements OnInit {
  /**
   * xBRBC balance.
   */
  @Input() balance: BigNumber;

  /**
   * Loading state of withdraw button.
   */
  @Input() loading: boolean;

  /**
   * Form control for amount of token user wants to withdraw.
   */
  @Input() amountFormControl: FormControl;

  /**
   * Max amount of unfreezed tokens.
   */
  @Input() maxAmountForWithdraw: BigNumber;

  /**
   * Emits event on leaving stake.
   */
  @Output() onWithdraw = new EventEmitter<void>();

  /**
   * Emits event on connecting wallet.
   */
  @Output() onLogin = new EventEmitter<void>();

  /**
   * Emits event on changing network
   */
  @Output() onChangeNetwork = new EventEmitter<void>();

  public readonly needLogin$ = this.stakingService.needLogin$;

  public readonly stakingTokenBalance$ = this.stakingService.stakingTokenBalance$;

  private readonly _errorType$ = new BehaviorSubject<ErrorTypeEnum | null>(
    ErrorTypeEnum.EMPTY_AMOUNT
  );

  get errorType$(): Observable<ErrorTypeEnum | null> {
    return this._errorType$.asObservable();
  }

  public readonly errorTypeEnum = ErrorTypeEnum;

  public readonly needChangeNetwork$ = new BehaviorSubject<boolean>(
    this.walletConnectorService.networkName !== BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN
  );

  constructor(
    private readonly stakingService: StakingService,
    private readonly walletConnectorService: WalletConnectorService,
    @Self() private readonly destroy$: TuiDestroyService
  ) {}

  public ngOnInit(): void {
    this.amountFormControl.valueChanges
      .pipe(
        map(amount => new BigNumber(amount ? amount.split(',').join('') : NaN)),
        withLatestFrom(this.stakingTokenBalance$),
        tap(([amount, stakingTokenBalance]) =>
          this.checkAmountAndBalance(amount, stakingTokenBalance)
        ),
        takeUntil(this.destroy$)
      )
      .subscribe();

    this.walletConnectorService.networkChange$
      .pipe(
        tap(() => {
          if (this.walletConnectorService.networkName !== BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN) {
            this.needChangeNetwork$.next(true);
          } else {
            this.needChangeNetwork$.next(false);
          }
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  private checkAmountAndBalance(amount: BigNumber, balance: BigNumber): void {
    if (amount.isZero()) {
      this._errorType$.next(ErrorTypeEnum.ZERO);
      return;
    }

    if (amount.isNaN()) {
      this._errorType$.next(ErrorTypeEnum.EMPTY_AMOUNT);
      return;
    }

    if (balance.lt(amount) || this.maxAmountForWithdraw.lt(amount)) {
      this._errorType$.next(ErrorTypeEnum.INSUFFICIENT_BALANCE);
      return;
    }

    this._errorType$.next(null);
  }

  public switchNetwork(): void {
    this.walletConnectorService.switchChain(BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN);
  }
}
