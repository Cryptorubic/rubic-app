import { BalanceToken } from '@app/shared/models/tokens/balance-token';
import { PrivateQuoteAdapter } from '../../shared-privacy-providers/models/quote-adapter';
import { SwapAmount } from '../../shared-privacy-providers/models/swap-info';
import BigNumber from 'bignumber.js';
import { ClearswapSwapService } from '@app/features/privacy/providers/clearswap/services/clearswap-swap.service';
import { TokenAmount } from '@cryptorubic/core';
import { FormControl } from '@angular/forms';
import { defer, Observable, retry, map, throwError, timer } from 'rxjs';

export class ClearswapQuoteAdapter implements PrivateQuoteAdapter {
  constructor(
    private readonly clearswapSwapService: ClearswapSwapService,
    private readonly receiverCtrl: FormControl<string>
  ) {}

  public quoteCallback(
    fromAsset: BalanceToken,
    toAsset: BalanceToken,
    fromAmount: SwapAmount
  ): Observable<{
    toAmountWei: BigNumber;
    tradeId?: string;
  }> {
    if (!this.receiverCtrl.value) {
      return throwError(() => new Error('Receiver address must not be empty'));
    }
    return defer(() =>
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
        delay: (error, retryCount) => {
          console.error('quote error:', error, 'retry #', retryCount);
          if (error?.message?.includes('Cannot retrieve information about')) {
            return timer(5000);
          }
          return throwError(() => error);
        }
      }),
      map(quoteResponse => ({
        toAmountWei: quoteResponse.tokenAmountWei,
        tradeId: quoteResponse.tradeId
      }))
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
