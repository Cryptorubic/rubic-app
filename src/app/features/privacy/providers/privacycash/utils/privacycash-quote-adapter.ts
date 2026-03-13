import { BalanceToken } from '@app/shared/models/tokens/balance-token';
import { PrivateQuoteAdapter } from '../../shared-privacy-providers/models/quote-adapter';
import { SwapAmount } from '../../shared-privacy-providers/models/swap-info';
import BigNumber from 'bignumber.js';
import { PrivacycashSwapService } from '../services/privacy-cash-swap.service';
import { NotificationsService } from '@app/core/services/notifications/notifications.service';
import { toPrivacyCashTokenAddr } from './converter';
import { from, map, Observable } from 'rxjs';

export class PrivacycashQuoteAdapter implements PrivateQuoteAdapter {
  constructor(
    private readonly privacycashSwapService: PrivacycashSwapService,
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
    const pcSupportedSrcToken = {
      ...fromAsset,
      address: toPrivacyCashTokenAddr(fromAsset.address)
    };
    const pcSupportedDstToken = {
      ...toAsset,
      address: toPrivacyCashTokenAddr(toAsset.address)
    };

    return from(
      this.privacycashSwapService.quote(
        pcSupportedSrcToken,
        pcSupportedDstToken,
        fromAmount.actualValue
      )
    ).pipe(map(dstToken => ({ toAmountWei: dstToken.weiAmount })));
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
