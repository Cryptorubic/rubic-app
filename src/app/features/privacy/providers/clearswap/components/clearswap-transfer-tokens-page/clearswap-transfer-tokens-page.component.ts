/* eslint-disable rxjs/no-exposed-subjects */
import { FormControl } from '@angular/forms';
import { ChangeDetectionStrategy, Component, OnInit, Self } from '@angular/core';
import { ClearswapSwapService } from '@app/features/privacy/providers/clearswap/services/clearswap-swap.service';
import { PrivateEvent } from '@app/features/privacy/providers/shared-privacy-providers/models/private-event';
import { Token } from '@app/shared/models/tokens/token';
import { BlockchainName, TokenAmount } from '@cryptorubic/core';
import {
  catchError,
  defer,
  finalize,
  from,
  Observable,
  of,
  retry,
  startWith,
  Subject,
  switchMap,
  takeUntil,
  tap,
  throwError,
  timer
} from 'rxjs';
import { ClearswapErrorService } from '../../services/clearswap-error.service';
import { NotificationsService } from '@app/core/services/notifications/notifications.service';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { PrivateActionButtonService } from '@app/features/privacy/providers/shared-privacy-providers/services/private-action-button/private-action-button.service';
import { clearswapFormConfig } from '@app/features/privacy/providers/clearswap/constants/clearswap-form-config';
import { PrivateTransferFormConfig } from '../../../shared-privacy-providers/models/swap-form-types';
import { isReceiverCorrect } from '@app/features/privacy/providers/clearswap/constants/receiver-validator';
import { AuthService } from '@app/core/services/auth/auth.service';
import InsufficientFundsError from '@app/core/errors/models/instant-trade/insufficient-funds-error';
import { RubicError } from '@app/core/errors/models/rubic-error';
import { RubicSdkError, Web3Pure } from '@cryptorubic/web3';
import { ErrorsService } from '@app/core/errors/errors.service';
import { PrivateStatisticsService } from '../../../shared-privacy-providers/services/private-statistics/private-statistics.service';
import { PRIVATE_TRADE_TYPE } from '@app/features/privacy/constants/private-trade-types';
import { TokensBalanceService } from '@app/core/services/tokens/tokens-balance.service';
import { PrivateTransferWindowService } from '../../../shared-privacy-providers/services/private-transfer-window/private-transfer-window.service';
import { compareTokens } from '@app/shared/utils/utils';

@Component({
  selector: 'app-clearswap-transfer-tokens-page',
  templateUrl: './clearswap-transfer-tokens-page.component.html',
  styleUrls: ['./clearswap-transfer-tokens-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class ClearswapTransferTokensPageComponent implements OnInit {
  public readonly nextTransfer$ = new Subject<PrivateEvent>();

  public readonly receiverCtrl = new FormControl<string>('', {
    asyncValidators: [isReceiverCorrect()]
  });

  public readonly clearswapFormConfig: PrivateTransferFormConfig = {
    ...clearswapFormConfig,
    withMaxBtn: true
  };

  constructor(
    private readonly clearswapSwapService: ClearswapSwapService,
    private readonly clearswapErrorService: ClearswapErrorService,
    private readonly notificationsService: NotificationsService,
    private readonly privateActionButtonService: PrivateActionButtonService,
    private readonly authService: AuthService,
    private readonly errorService: ErrorsService,
    private readonly privateStatisticsService: PrivateStatisticsService,
    private readonly tokensBalanceService: TokensBalanceService,
    private readonly privateTransferWindowService: PrivateTransferWindowService,
    @Self() private readonly destroy$: TuiDestroyService
  ) {}

  ngOnInit(): void {
    this.nextTransfer$
      .pipe(
        switchMap(event => this.transfer(event)),
        takeUntil(this.destroy$)
      )
      .subscribe();

    this.receiverCtrl.valueChanges
      .pipe(
        startWith(this.receiverCtrl.value),
        tap(address => {
          this.privateActionButtonService.setReceiverAddress(address);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  private transfer({ token, loadingCallback, openPreview }: PrivateEvent): Observable<void> {
    const userAddress = this.authService.userAddress;
    return from(this.tokensBalanceService.getAndUpdateTokenBalance(token, 5)).pipe(
      tap(balance => {
        this.privateTransferWindowService.setTransferAsset({
          ...this.privateTransferWindowService.transferAsset,
          amount: balance
        });
        if (!balance.gte(token.tokenAmount)) {
          throw new InsufficientFundsError(token.symbol);
        }
      }),
      switchMap(() =>
        defer(() =>
          this.clearswapSwapService.quote(
            token as TokenAmount<BlockchainName>,
            { ...token } as Token,
            this.receiverCtrl.value
          )
        ).pipe(
          retry({
            count: 5,
            delay: (error, retryCount) => {
              console.error('quote error:', error, 'retry #', retryCount);
              if (error?.message?.includes('Cannot retrieve information about')) {
                return timer(5000);
              }
              return throwError(() => error);
            }
          })
        )
      ),
      switchMap(quoteResponse => {
        if ('tradeId' in quoteResponse) {
          const { tradeId, tokenAmount: dstTokenAmount } = quoteResponse;
          const displayAmount =
            token.tokenAmount.minus(dstTokenAmount).toString() + ' ' + token.symbol;
          const nativeToken = {
            address: Web3Pure.getNativeTokenAddress(token.blockchain),
            blockchain: token.blockchain
          };

          return openPreview({
            dstTokenAmount,
            displayAmount,
            steps: [
              {
                label: 'Transfer tokens',
                action: () =>
                  this.clearswapSwapService
                    .transfer(
                      tradeId,
                      token as TokenAmount<BlockchainName>,
                      { ...token } as Token,
                      this.receiverCtrl.value
                    )
                    .then(async () => {
                      this.privateStatisticsService.saveAction(
                        'TRANSFER',
                        PRIVATE_TRADE_TYPE.CLEARSWAP,
                        userAddress,
                        token.address,
                        token.stringWeiAmount,
                        token.blockchain
                      );

                      const newBalance = await this.tokensBalanceService.getAndUpdateTokenBalance(
                        token,
                        5
                      );
                      if (compareTokens(this.privateTransferWindowService.transferAsset, token)) {
                        this.privateTransferWindowService.setTransferAsset({
                          ...this.privateTransferWindowService.transferAsset,
                          amount: newBalance
                        });
                      }
                    })
                    .catch(async () => {
                      const nativeBalance =
                        await this.tokensBalanceService.getAndUpdateTokenBalance(nativeToken, 5);
                      if (
                        compareTokens(this.privateTransferWindowService.transferAsset, nativeToken)
                      ) {
                        this.privateTransferWindowService.setTransferAsset({
                          ...this.privateTransferWindowService.transferAsset,
                          amount: nativeBalance
                        });
                      }
                    })
              }
            ]
          });
        }

        this.clearswapErrorService.setTradeError(quoteResponse.tradeError);
        return of(null);
      }),
      catchError(error => {
        if (error instanceof RubicError || error instanceof RubicSdkError) {
          this.errorService.catch(error);
        } else {
          this.notificationsService.showError('Something went wrong. Please, try again later.');
        }
        return of(null);
      }),
      finalize(() => {
        loadingCallback();
      })
    );
  }
}
