import { Injectable } from '@angular/core';
import { ChangenowPostTrade } from '@features/swaps/core/services/changenow-post-trade-service/models/changenow-post-trade';
import { StoreService } from '@core/services/store/store.service';
import { ChangenowPaymentInfo } from 'rubic-sdk';
import { SwapFormService } from '@core/services/swaps/swap-form.service';
import { Token } from '@app/shared/models/tokens/token';

@Injectable()
export class ChangenowPostTradeService {
  public trade: ChangenowPostTrade | undefined;

  constructor(
    private readonly storeService: StoreService,
    private readonly swapFormService: SwapFormService
  ) {
    this.trade = this.storeService.getItem('changenowPostTrade');
  }

  public updateTrade(paymentInfo: ChangenowPaymentInfo, receiverAddress: string): void {
    const { fromAsset, toToken, fromAmount } = this.swapFormService.inputValue;
    const { toAmount } = this.swapFormService.outputValue;

    this.trade = {
      id: paymentInfo.id,

      fromToken: fromAsset as Token,
      toToken,
      fromAmount: fromAmount.toFixed(),
      toAmount: toAmount.toFixed(),

      depositAddress: paymentInfo.depositAddress,
      receiverAddress,

      extraField: paymentInfo.extraField
    };
    this.storeService.setItem('changenowPostTrade', this.trade);
  }

  public setupUpdate(): void {
    // todo make interval with requests on status
  }
}
