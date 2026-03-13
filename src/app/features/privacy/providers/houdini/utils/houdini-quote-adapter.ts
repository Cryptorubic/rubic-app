import { BalanceToken } from '@app/shared/models/tokens/balance-token';
import { PrivateQuoteAdapter } from '../../shared-privacy-providers/models/quote-adapter';
import { SwapAmount } from '../../shared-privacy-providers/models/swap-info';
import BigNumber from 'bignumber.js';
import { NotificationsService } from '@app/core/services/notifications/notifications.service';
import { HoudiniSwapService } from '@app/features/privacy/providers/houdini/services/houdini-swap.service';
import { TokenAmount } from '@cryptorubic/core';
import { TargetNetworkAddressService } from '@app/features/trade/services/target-network-address-service/target-network-address.service';
import { from, map, Observable } from 'rxjs';

export class HoudiniQuoteAdapter implements PrivateQuoteAdapter {
  constructor(
    private readonly houdiniSwapService: HoudiniSwapService,
    private readonly notificationsService: NotificationsService,
    private readonly targetAddressService: TargetNetworkAddressService
  ) {}

  public quoteCallback(
    fromAsset: BalanceToken,
    toAsset: BalanceToken,
    fromAmount: SwapAmount
  ): Observable<{
    toAmountWei: BigNumber;
    tradeId?: string;
  }> {
    return from(
      this.houdiniSwapService.quote(
        new TokenAmount({
          ...fromAsset,
          tokenAmount: fromAmount.actualValue
        }),
        toAsset,
        this.targetAddressService.address
      )
    ).pipe(
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
    err: unknown
  ): Promise<BigNumber> {
    const msg = `Quote request failed. ${err}.`;
    this.notificationsService.showWarning(msg);
    return new BigNumber(0);
  }
}
