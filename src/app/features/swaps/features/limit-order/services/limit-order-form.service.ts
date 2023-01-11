import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, distinctUntilChanged } from 'rxjs';
import { TRADE_STATUS } from '@shared/models/swaps/trade-status';
import { SdkService } from '@core/services/sdk/sdk.service';
import { SwapFormService } from '@core/services/swaps/swap-form.service';
import { EvmBlockchainName, TokenAmount as SdkTokenAmount, TokenBaseStruct } from 'rubic-sdk';
import { AvailableTokenAmount } from '@shared/models/tokens/available-token-amount';
import { compareTokens } from '@shared/utils/utils';

@Injectable()
export class LimitOrderFormService {
  private readonly _tradeStatus$ = new BehaviorSubject<TRADE_STATUS>(TRADE_STATUS.DISABLED);

  public readonly tradeStatus$ = this._tradeStatus$.asObservable();

  /**
   * Contains true, in case `approve` button must be shown in form.
   */
  private readonly _displayApproveButton$ = new BehaviorSubject<boolean>(false);

  public readonly displayApproveButton$ = this._displayApproveButton$.asObservable();

  private prevFromTokenAmount: SdkTokenAmount | null = null;

  private needApprove = false;

  private get isFormFilled(): boolean {
    const form = this.swapFormService.form.value;
    return (
      form.input.fromAsset &&
      form.input.fromAmount?.gt(0) &&
      form.input.toToken &&
      form.output.toAmount?.gt(0)
    );
  }

  constructor(
    private readonly sdkService: SdkService,
    private readonly swapFormService: SwapFormService
  ) {
    this.subscribeOnFormChanges();
  }

  private subscribeOnFormChanges(): void {
    combineLatest([
      this.swapFormService.inputValueDistinct$,
      this.swapFormService.outputValue$.pipe(distinctUntilChanged())
    ]).subscribe(() => {
      this.updateStatus();
    });
  }

  private async updateStatus(): Promise<void> {
    this._displayApproveButton$.next(false);
    if (!this.isFormFilled) {
      this._tradeStatus$.next(TRADE_STATUS.DISABLED);
      return;
    }

    this._tradeStatus$.next(TRADE_STATUS.LOADING);

    const { fromAsset, fromAmount } = this.swapFormService.inputValue;
    const fromTokenAmount = await SdkTokenAmount.createToken({
      ...(fromAsset as TokenBaseStruct<EvmBlockchainName>),
      tokenAmount: fromAmount
    });
    if (
      !this.prevFromTokenAmount ||
      !compareTokens(this.prevFromTokenAmount, fromTokenAmount) ||
      !this.prevFromTokenAmount.tokenAmount.eq(fromAmount)
    ) {
      this.prevFromTokenAmount = fromTokenAmount;

      this.needApprove = await this.sdkService.limitOrderManager.needApprove(
        fromTokenAmount,
        fromAmount
      );
    }
    if (this.needApprove) {
      this._tradeStatus$.next(TRADE_STATUS.READY_TO_APPROVE);
      this._displayApproveButton$.next(true);
    } else {
      this._tradeStatus$.next(TRADE_STATUS.READY_TO_SWAP);
    }
  }

  public async approve(): Promise<void> {
    const { fromAsset, fromAmount } = this.swapFormService.inputValue;

    this._tradeStatus$.next(TRADE_STATUS.APPROVE_IN_PROGRESS);
    try {
      await this.sdkService.limitOrderManager.approve(
        fromAsset as TokenBaseStruct<EvmBlockchainName>,
        fromAmount,
        {}
      );
      this._tradeStatus$.next(TRADE_STATUS.READY_TO_SWAP);
    } catch (err) {
      this._tradeStatus$.next(TRADE_STATUS.READY_TO_APPROVE);
    }
  }

  public async onCreateOrder(): Promise<void> {
    const { fromAsset, fromAmount, toToken } = this.swapFormService.inputValue;
    const fromToken = fromAsset as AvailableTokenAmount;
    const { toAmount } = this.swapFormService.outputValue;

    this._tradeStatus$.next(TRADE_STATUS.SWAP_IN_PROGRESS);
    try {
      await this.sdkService.limitOrderManager.createOrder(
        fromToken as TokenBaseStruct<EvmBlockchainName>,
        toToken as TokenBaseStruct<EvmBlockchainName>,
        fromAmount,
        toAmount
      );
    } catch {}
    this._tradeStatus$.next(TRADE_STATUS.READY_TO_SWAP);
  }
}
