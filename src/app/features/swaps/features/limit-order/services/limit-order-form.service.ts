import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TRADE_STATUS } from '@shared/models/swaps/trade-status';
import { SdkService } from '@core/services/sdk/sdk.service';
import { SwapFormService } from '@core/services/swaps/swap-form.service';
import { EvmBlockchainName, TokenAmount as SdkTokenAmount } from 'rubic-sdk';
import { AvailableTokenAmount } from '@shared/models/tokens/available-token-amount';

@Injectable()
export class LimitOrderFormService {
  private readonly _tradeStatus$ = new BehaviorSubject<TRADE_STATUS>(TRADE_STATUS.DISABLED);

  public readonly tradeStatus$ = this._tradeStatus$.asObservable();

  constructor(
    private readonly sdkService: SdkService,
    private readonly swapFormService: SwapFormService
  ) {
    this.subscribeOnFormChanges();
  }

  private subscribeOnFormChanges(): void {
    this.swapFormService.form.valueChanges.subscribe(form => {
      if (
        form.input.fromAsset &&
        form.input.fromAmount?.gt(0) &&
        form.input.toToken &&
        form.output.toAmount?.gt(0)
      ) {
        this._tradeStatus$.next(TRADE_STATUS.READY_TO_SWAP);
      } else {
        this._tradeStatus$.next(TRADE_STATUS.DISABLED);
      }
    });
  }

  public async onCreateOrder(): Promise<void> {
    const { fromAsset, fromAmount, toToken } = this.swapFormService.inputValue;
    const fromToken = fromAsset as AvailableTokenAmount;
    const { toAmount } = this.swapFormService.outputValue;

    const sdkFromToken = new SdkTokenAmount<EvmBlockchainName>({
      ...fromToken,
      blockchain: fromToken.blockchain as EvmBlockchainName,
      tokenAmount: fromAmount
    });
    const sdkToToken = new SdkTokenAmount<EvmBlockchainName>({
      ...toToken,
      blockchain: toToken.blockchain as EvmBlockchainName,
      tokenAmount: toAmount
    });

    this._tradeStatus$.next(TRADE_STATUS.LOADING);
    await this.sdkService.limitOrderManager.createOrder(sdkFromToken, sdkToToken);
    this._tradeStatus$.next(TRADE_STATUS.READY_TO_SWAP);
  }
}
