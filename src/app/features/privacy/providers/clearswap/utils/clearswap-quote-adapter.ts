import { BalanceToken } from '@app/shared/models/tokens/balance-token';
import { PrivateQuoteAdapter } from '../../shared-privacy-providers/models/quote-adapter';
import { SwapAmount } from '../../shared-privacy-providers/models/swap-info';
import BigNumber from 'bignumber.js';
import { ClearswapSwapService } from '@app/features/privacy/providers/clearswap/services/clearswap-swap.service';
import { BLOCKCHAIN_NAME, TokenAmount } from '@cryptorubic/core';
import {
  catchError,
  defer,
  from,
  map,
  Observable,
  retry,
  switchMap,
  tap,
  throwError,
  timer
} from 'rxjs';
import { ClearswapErrorService } from '@app/features/privacy/providers/clearswap/services/clearswap-error.service';
import { FormControl } from '@angular/forms';
import { NotificationsService } from '@app/core/services/notifications/notifications.service';
import { Web3Pure } from '@cryptorubic/web3';

export class ClearswapQuoteAdapter implements PrivateQuoteAdapter {
  constructor(
    private readonly clearswapSwapService: ClearswapSwapService,
    private readonly receiverCtrl: FormControl<string>,
    private readonly clearswapErrorService: ClearswapErrorService,
    private readonly notificationsService: NotificationsService
  ) {}

  public quoteCallback(
    fromAsset: BalanceToken,
    toAsset: BalanceToken,
    fromAmount: SwapAmount
  ): Observable<{
    toAmountWei: BigNumber;
    tradeId?: string;
  }> {
    const receiver = this.receiverCtrl.value;
    if (!this.receiverCtrl.value) {
      return throwError(() => new Error('Receiver address must not be empty'));
    }
    return from(Web3Pure.getInstance(BLOCKCHAIN_NAME.TRON).isAddressCorrect(receiver)).pipe(
      tap(isCorrect => {
        if (!isCorrect) {
          throw Error('Incorrect receiver address');
        }
      }),
      switchMap(() =>
        defer(() =>
          this.clearswapSwapService.quote(
            new TokenAmount({
              ...fromAsset,
              tokenAmount: fromAmount.actualValue
            }),
            toAsset,
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
          }),
          catchError(error => {
            this.notificationsService.showError('Something went wrong. Please, try again later.');
            return throwError(() => error);
          }),
          map(quoteResponse => {
            if ('tradeId' in quoteResponse) {
              return {
                toAmountWei: quoteResponse.tokenAmountWei,
                tradeId: quoteResponse.tradeId
              };
            }

            this.clearswapErrorService.setTradeError(quoteResponse.tradeError);
            throw new Error(quoteResponse.tradeError.reason);
          })
        )
      )
    );
  }

  public async quoteFallback(
    _fromAsset: BalanceToken,
    _toAsset: BalanceToken,
    _fromAmount: SwapAmount,
    _err: unknown
  ): Promise<BigNumber> {
    return new BigNumber(0);
  }
}
