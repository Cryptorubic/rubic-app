import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, distinctUntilChanged, from, of, Subject } from 'rxjs';
import { TRADE_STATUS } from '@shared/models/swaps/trade-status';
import { SdkService } from '@core/services/sdk/sdk.service';
import { SwapFormService } from '@core/services/swaps/swap-form.service';
import {
  BlockchainName,
  BlockchainsInfo,
  EvmBlockchainName,
  TokenAmount as SdkTokenAmount,
  TokenBaseStruct
} from 'rubic-sdk';
import { AvailableTokenAmount } from '@shared/models/tokens/available-token-amount';
import { compareTokens } from '@shared/utils/utils';
import { debounceTime, map, switchMap } from 'rxjs/operators';
import { SwapTypeService } from '@core/services/swaps/swap-type.service';
import { SWAP_PROVIDER_TYPE } from '@features/swaps/features/swap-form/models/swap-provider-type';
import { AuthService } from '@core/services/auth/auth.service';
import { SwapFormInputTokens } from '@core/services/swaps/models/swap-form-tokens';
import { RubicError } from '@core/errors/models/rubic-error';
import { TokenAmount } from '@shared/models/tokens/token-amount';

@Injectable()
export class LimitOrderFormService {
  private readonly _tradeStatus$ = new BehaviorSubject<TRADE_STATUS>(TRADE_STATUS.DISABLED);

  public readonly tradeStatus$ = this._tradeStatus$.pipe(debounceTime(200));

  private set tradeStatus(value: TRADE_STATUS) {
    this._tradeStatus$.next(value);
  }

  /**
   * Contains true, in case `approve` button must be shown in form.
   */
  private readonly _displayApproveButton$ = new BehaviorSubject<boolean>(false);

  public readonly displayApproveButton$ = this._displayApproveButton$.asObservable();

  private prevFromTokenAmount: SdkTokenAmount | null = null;

  private needApprove = false;

  /**
   * Controls approve calculation flow.
   * When `next` is called, recalculation is started.
   */
  private readonly _calculateTrade$ = new Subject<{ stop?: boolean }>();

  private get isFormFilled(): boolean {
    const form = this.swapFormService.form.value;
    return (
      form.input.fromAsset &&
      form.input.fromAmount?.gt(0) &&
      form.input.toToken &&
      form.output.toAmount?.gt(0)
    );
  }

  /**
   * Returns form input value.
   * Must be used only if form contains blockchains asset types.
   */
  public get inputValue(): SwapFormInputTokens {
    const inputForm = this.swapFormService.inputValue;
    if (inputForm.fromAssetType && !BlockchainsInfo.isBlockchainName(inputForm.fromAssetType)) {
      throw new RubicError('Cannot use cross chain');
    }
    return {
      ...inputForm,
      fromBlockchain: inputForm.fromAssetType as BlockchainName,
      fromToken: inputForm.fromAsset as TokenAmount
    };
  }

  constructor(
    private readonly sdkService: SdkService,
    private readonly swapFormService: SwapFormService,
    private readonly swapTypeService: SwapTypeService,
    private readonly authService: AuthService
  ) {
    this.subscribeOnCalculation();

    this.subscribeOnFormChanges();
  }

  /**
   * Subscribe on 'calculate' subject, which controls flow of calculation.
   * Can be called only once in constructor.
   */
  private subscribeOnCalculation(): void {
    this._calculateTrade$
      .pipe(
        debounceTime(200),
        map(calculateData => {
          if (calculateData.stop || !this.isFormFilled) {
            this.tradeStatus = TRADE_STATUS.DISABLED;
            return { ...calculateData, stop: true };
          }
          return { ...calculateData, stop: false };
        }),
        switchMap(calculateData => {
          if (calculateData.stop) {
            return of(null);
          }

          const { fromBlockchain, fromToken, fromAmount } = this.inputValue;
          const isUserAuthorized =
            Boolean(this.authService.userAddress) &&
            this.authService.userChainType === BlockchainsInfo.getChainType(fromBlockchain);
          if (!isUserAuthorized) {
            return of(null);
          }

          this.tradeStatus = TRADE_STATUS.LOADING;
          return from(
            SdkTokenAmount.createToken({
              ...(fromToken as TokenBaseStruct<EvmBlockchainName>),
              tokenAmount: fromAmount
            })
          ).pipe(
            switchMap(async fromTokenAmount => {
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
              this.tradeStatus = this.needApprove
                ? TRADE_STATUS.READY_TO_APPROVE
                : TRADE_STATUS.READY_TO_SWAP;
              this._displayApproveButton$.next(this.needApprove);
            })
          );
        })
      )
      .subscribe();
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
    if (this.swapTypeService.getSwapProviderType() !== SWAP_PROVIDER_TYPE.LIMIT_ORDER) {
      return;
    }
    this._calculateTrade$.next({});
  }

  public async approve(): Promise<void> {
    const { fromAsset, fromAmount } = this.swapFormService.inputValue;

    this.tradeStatus = TRADE_STATUS.APPROVE_IN_PROGRESS;
    try {
      await this.sdkService.limitOrderManager.approve(
        fromAsset as TokenBaseStruct<EvmBlockchainName>,
        fromAmount,
        {}
      );
      this.tradeStatus = TRADE_STATUS.READY_TO_SWAP;
    } catch (err) {
      this.tradeStatus = TRADE_STATUS.READY_TO_APPROVE;
    }
  }

  public async onCreateOrder(): Promise<void> {
    const { fromAsset, fromAmount, toToken } = this.swapFormService.inputValue;
    const fromToken = fromAsset as AvailableTokenAmount;
    const { toAmount } = this.swapFormService.outputValue;

    this.tradeStatus = TRADE_STATUS.SWAP_IN_PROGRESS;
    try {
      await this.sdkService.limitOrderManager.createOrder(
        fromToken as TokenBaseStruct<EvmBlockchainName>,
        toToken as TokenBaseStruct<EvmBlockchainName>,
        fromAmount,
        toAmount
      );
    } catch {}
    this.tradeStatus = TRADE_STATUS.READY_TO_SWAP;
  }
}
