import { PrivateQuoteAdapter } from '@app/features/privacy/providers/shared-privacy-providers/models/quote-adapter';
import { SwapAmount } from '@app/features/privacy/providers/shared-privacy-providers/models/swap-info';
import { BalanceToken } from '@app/shared/models/tokens/balance-token';
import BigNumber from 'bignumber.js';
import { HinkalQuoteService } from '../../hinkal-quote.service';
import { NotificationsService } from '@app/core/services/notifications/notifications.service';

export class HinkalQuoteAdapter implements PrivateQuoteAdapter {
  constructor(
    private readonly hinkalQuoteService: HinkalQuoteService,
    private readonly notificationsService: NotificationsService
  ) {}

  public async quoteCallback(
    fromAsset: BalanceToken,
    toAsset: BalanceToken,
    fromAmount: SwapAmount
  ): Promise<BigNumber> {
    const toTokenAmount = await this.hinkalQuoteService.fetchQuote(
      fromAsset,
      toAsset,
      fromAmount.visibleValue
    );

    return toTokenAmount.weiAmount;
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
