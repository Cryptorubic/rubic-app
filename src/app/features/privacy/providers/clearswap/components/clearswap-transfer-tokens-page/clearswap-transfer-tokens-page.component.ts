/* eslint-disable rxjs/no-exposed-subjects */
import { FormControl } from '@angular/forms';
import { ChangeDetectionStrategy, Component, OnInit, Self } from '@angular/core';
import { TokensFacadeService } from '@app/core/services/tokens/tokens-facade.service';
import { ClearswapPrivateAssetsService } from '@app/features/privacy/providers/clearswap/services/clearswap-private-assets.service';
import { ClearswapSwapService } from '@app/features/privacy/providers/clearswap/services/clearswap-swap.service';
import { ClearswapTokensFacadeService } from '@app/features/privacy/providers/clearswap/services/clearswap-tokens-facade.service';
import { PrivateEvent } from '@app/features/privacy/providers/shared-privacy-providers/models/private-event';
import { ToAssetsService } from '@app/features/trade/components/assets-selector/services/to-assets.service';
import { Token } from '@app/shared/models/tokens/token';
import { BlockchainName, TokenAmount } from '@cryptorubic/core';
import {
  catchError,
  defer,
  finalize,
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
import { RubicSdkError } from '@cryptorubic/web3';
import { ErrorsService } from '@app/core/errors/errors.service';

@Component({
  selector: 'app-clearswap-transfer-tokens-page',
  templateUrl: './clearswap-transfer-tokens-page.component.html',
  styleUrls: ['./clearswap-transfer-tokens-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    TuiDestroyService,
    { provide: ToAssetsService, useClass: ClearswapPrivateAssetsService },
    { provide: TokensFacadeService, useClass: ClearswapTokensFacadeService }
  ]
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
    return defer(() =>
      this.clearswapSwapService.chainAdapter.checkEnoughBalance(token, this.authService.userAddress)
    )
      .pipe(
        retry({
          count: 5,
          delay: (error, retryCount) => {
            console.error('check balance error:', error, 'retry #', retryCount);
            if (error?.message?.includes('Request failed with status code 429')) {
              return timer(5000);
            }
            return throwError(() => error);
          }
        }),
        tap(isEnoughBalance => {
          if (!isEnoughBalance) {
            throw new InsufficientFundsError(token.symbol);
          }
        })
      )
      .pipe(
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
            return openPreview({
              dstTokenAmount,
              displayAmount,
              steps: [
                {
                  label: 'Transfer tokens',
                  action: () =>
                    this.clearswapSwapService.transfer(
                      tradeId,
                      token as TokenAmount<BlockchainName>,
                      { ...token } as Token,
                      this.receiverCtrl.value
                    )
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
