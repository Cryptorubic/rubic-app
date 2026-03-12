import { BalanceToken } from '@app/shared/models/tokens/balance-token';
import { PrivateQuoteAdapter } from '../../shared-privacy-providers/models/quote-adapter';
import { SwapAmount } from '../../shared-privacy-providers/models/swap-info';
import BigNumber from 'bignumber.js';
import { NotificationsService } from '@app/core/services/notifications/notifications.service';
import { ClearswapSwapService } from '@app/features/privacy/providers/clearswap/services/clearswap-swap.service';
import { TokenAmount } from '@cryptorubic/core';
import { FormControl } from '@angular/forms';

export class ClearswapQuoteAdapter implements PrivateQuoteAdapter {
  constructor(
    private readonly clearswapSwapService: ClearswapSwapService,
    private readonly notificationsService: NotificationsService,
    private readonly receiverCtrl: FormControl<string>
  ) {}

  public async quoteCallback(
    fromAsset: BalanceToken,
    toAsset: BalanceToken,
    fromAmount: SwapAmount
  ): Promise<{
    toAmountWei: BigNumber;
    tradeId?: string;
  }> {
    const quoteResponse = await this.clearswapSwapService.quote(
      new TokenAmount({
        ...fromAsset,
        tokenAmount: fromAmount.actualValue
      }),
      toAsset,
      this.receiverCtrl.value
    );
    return {
      toAmountWei: quoteResponse.tokenAmountWei,
      tradeId: quoteResponse.tradeId
    };
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
