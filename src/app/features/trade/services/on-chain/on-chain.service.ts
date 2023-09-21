import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { SWAP_PROVIDER_TYPE } from '@features/swaps/features/swap-form/models/swap-provider-type';
import { map } from 'rxjs/operators';
import { SdkService } from '@core/services/sdk/sdk.service';
import { SwapsFormService } from '@features/trade/services/swaps-form/swaps-form.service';
import { TradeContainer } from '@features/trade/models/trade-container';
import { OnChainTrade } from 'rubic-sdk';

@Injectable()
export class OnChainService {
  constructor(
    private readonly sdkService: SdkService,
    private readonly swapFormService: SwapsFormService
  ) {}

  public calculateTrades(): Observable<TradeContainer> {
    const { fromToken, toToken, fromAmount } = this.swapFormService.inputValue;

    return this.sdkService.instantTrade
      .calculateTradeReactively(fromToken, fromAmount.toFixed(), toToken.address)
      .pipe(map(el => ({ value: el, type: SWAP_PROVIDER_TYPE.INSTANT_TRADE })));
  }

  public async swapTrade(trade: OnChainTrade, callback?: (hash: string) => void): Promise<void> {
    await trade.swap({
      onConfirm: callback
    });
  }

  public async approveTrade(trade: OnChainTrade, callback?: (hash: string) => void): Promise<void> {
    await trade.approve({
      onTransactionHash: callback
    });
  }
}
