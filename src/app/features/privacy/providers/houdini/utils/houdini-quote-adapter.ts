import { BalanceToken } from '@app/shared/models/tokens/balance-token';
import { PrivateQuoteAdapter } from '../../shared-privacy-providers/models/quote-adapter';
import { SwapAmount } from '../../shared-privacy-providers/models/swap-info';
import BigNumber from 'bignumber.js';
import { HoudiniSwapService } from '@app/features/privacy/providers/houdini/services/houdini-swap.service';
import { TokenAmount } from '@cryptorubic/core';
import { TargetNetworkAddressService } from '@app/features/trade/services/target-network-address-service/target-network-address.service';
import { defer, map, Observable, retry, throwError, timer } from 'rxjs';
import { HoudiniErrorService } from '@app/features/privacy/providers/houdini/services/houdini-error.service';

export class HoudiniQuoteAdapter implements PrivateQuoteAdapter {
  constructor(
    private readonly houdiniSwapService: HoudiniSwapService,
    private readonly targetAddressService: TargetNetworkAddressService,
    private readonly houdiniErrorService: HoudiniErrorService
  ) {}

  public quoteCallback(
    fromAsset: BalanceToken,
    toAsset: BalanceToken,
    fromAmount: SwapAmount
  ): Observable<{
    toAmountWei: BigNumber;
    tradeId?: string;
  }> {
    if (!this.targetAddressService.address) {
      return throwError(() => new Error('Receiver address must not be empty'));
    }
    return defer(() =>
      this.houdiniSwapService.quote(
        new TokenAmount({
          ...fromAsset,
          tokenAmount: fromAmount.actualValue
        }),
        toAsset,
        this.targetAddressService.address
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
      map(quoteResponse => {
        if ('tradeId' in quoteResponse) {
          return {
            toAmountWei: quoteResponse.tokenAmountWei,
            tradeId: quoteResponse.tradeId
          };
        }

        this.houdiniErrorService.setTradeError(quoteResponse.tradeError);
        throw new Error(quoteResponse.tradeError.reason);
      })
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
