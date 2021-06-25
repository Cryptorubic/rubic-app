import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';
import { CryptoTapFormService } from 'src/app/features/crypto-tap/services/crypto-tap-form-service/crypto-tap-form.service';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { blockchainsList } from 'src/app/features/swaps/constants/BlockchainsList';
import { FromToAvailableTokens } from 'src/app/features/crypto-tap/models/FromToAvailableTokens';
import { CryptoTapTokensService } from 'src/app/features/crypto-tap/services/crypto-tap-tokens-service/crypto-tap-tokens.service';
import { Subscription, throwError } from 'rxjs';
import { CryptoTapService } from 'src/app/features/crypto-tap/services/crypto-tap-service/crypto-tap.service';
import { TRADE_STATUS } from 'src/app/shared/models/swaps/TRADE_STATUS';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { filter, mergeMap, tap } from 'rxjs/operators';
import BigNumber from 'bignumber.js';
import { ErrorsService } from 'src/app/core/errors/errors.service';
import { RubicError } from 'src/app/shared/models/errors/RubicError';
import { CryptoTapTrade } from 'src/app/features/crypto-tap/models/CryptoTapTrade';

@Component({
  selector: 'app-crypto-tap-form',
  templateUrl: './crypto-tap-form.component.html',
  styleUrls: ['./crypto-tap-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CryptoTapFormComponent implements OnInit, OnDestroy {
  public tokensLoading = true;

  public TRADE_STATUS = TRADE_STATUS;

  public tradeStatus: TRADE_STATUS;

  public needApprove = false;

  public $tokensSubscription: Subscription;

  public $formSubscription: Subscription;

  public $userSubscription: Subscription;

  public blockchainsListFrom = blockchainsList.filter(
    blockchain => blockchain.symbol === BLOCKCHAIN_NAME.ETHEREUM
  );

  public blockchainsListTo = blockchainsList.filter(
    blockchain =>
      blockchain.symbol === BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN ||
      blockchain.symbol === BLOCKCHAIN_NAME.POLYGON
  );

  public availableTokens: FromToAvailableTokens = {
    from: [],
    to: []
  };

  constructor(
    private cdr: ChangeDetectorRef,
    private cryptoTapService: CryptoTapService,
    public cryptoTapFormService: CryptoTapFormService,
    private cryptoTapTokenService: CryptoTapTokensService,
    private authService: AuthService,
    private errorsService: ErrorsService
  ) {}

  ngOnInit(): void {
    this.$tokensSubscription = this.cryptoTapTokenService.availableTokens$.subscribe(tokens => {
      if (!tokens.from?.length) {
        return;
      }
      this.availableTokens = tokens;
      this.tokensLoading = false;
      this.cdr.detectChanges();
    });

    this.$formSubscription =
      this.cryptoTapFormService.commonTrade.controls.input.valueChanges.subscribe(() =>
        this.calculateTrade()
      );

    this.$userSubscription = this.authService
      .getCurrentUser()
      .pipe(filter(user => !!user?.address))
      .subscribe(() => this.calculateTrade());
  }

  ngOnDestroy() {
    this.$tokensSubscription.unsubscribe();
  }

  private calculateTrade() {
    const { fromToken, toToken } = this.cryptoTapFormService.commonTrade.controls.input.value;
    if (!fromToken || !toToken) {
      this.cryptoTapFormService.commonTrade.controls.output.patchValue({
        toAmount: new BigNumber(0),
        fromAmount: new BigNumber(0),
        fee: new BigNumber(0)
      });
      return;
    }

    this.tradeStatus = TRADE_STATUS.LOADING;
    this.cdr.detectChanges();

    this.cryptoTapService
      .calculateTrade()
      .pipe(
        tap((trade: CryptoTapTrade) => {
          const { toAmount, fromAmount, fee } = trade;
          if (
            this.isBNIncorrect(toAmount) ||
            this.isBNIncorrect(fromAmount) ||
            this.isBNIncorrect(fee)
          ) {
            console.error('Incorrect crypto tap output parameters');
            throwError(new RubicError());
          }

          this.cryptoTapFormService.commonTrade.controls.output.patchValue({
            toAmount,
            fromAmount,
            fee
          });
        }),
        mergeMap((trade: CryptoTapTrade) => this.cryptoTapService.needApprove(trade.fromAmount))
      )
      .subscribe(
        (needApprove: boolean) => {
          this.needApprove = needApprove;
          if (needApprove) {
            this.tradeStatus = TRADE_STATUS.READY_TO_APPROVE;
          } else {
            this.tradeStatus = TRADE_STATUS.READY_TO_SWAP;
          }
          this.cdr.detectChanges();
        },
        err => this.errorsService.catch$(err)
      );
  }

  private isBNIncorrect(bn: BigNumber): boolean {
    return !bn.isFinite() || bn.eq(0) || bn.isNaN();
  }
}
