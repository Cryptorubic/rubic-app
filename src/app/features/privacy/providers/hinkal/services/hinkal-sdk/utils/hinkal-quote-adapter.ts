import { PrivateQuoteAdapter } from '@app/features/privacy/providers/shared-privacy-providers/models/quote-adapter';
import { SwapAmount } from '@app/features/privacy/providers/shared-privacy-providers/models/swap-info';
import { BalanceToken } from '@app/shared/models/tokens/balance-token';
import BigNumber from 'bignumber.js';
import { NotificationsService } from '@app/core/services/notifications/notifications.service';
import { from, map, Observable } from 'rxjs';
import { HinkalWorkerService } from '../hinkal-worker.service';
import { QuoteParams } from '../workers/models/worker-params';

export class HinkalQuoteAdapter implements PrivateQuoteAdapter {
  constructor(
    private readonly workerService: HinkalWorkerService,
    private readonly notificationsService: NotificationsService
  ) {}

  public quoteCallback(
    fromAsset: BalanceToken,
    toAsset: BalanceToken,
    fromAmount: SwapAmount
  ): Observable<{ toAmountWei: BigNumber }> {
    const params: QuoteParams = {
      fromAsset,
      toAsset,
      fromTokenStringAmount: fromAmount.visibleValue
    };

    return from(
      this.workerService.request<string>({
        type: 'quote',
        params
      })
    ).pipe(map(stringWeiAmount => ({ toAmountWei: new BigNumber(stringWeiAmount) })));
  }

  public async quoteFallback(
    _fromAsset: BalanceToken,
    _toAsset: BalanceToken,
    _fromAmount: SwapAmount,
    err: unknown
  ): Promise<BigNumber> {
    const msg = `Quote request failed. ${err}.`;
    this.notificationsService.showWarning(msg);
    return new BigNumber(0);
  }
}
