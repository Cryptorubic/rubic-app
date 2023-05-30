import { Injectable } from '@angular/core';
import { BehaviorSubject, from, of, Subject, Subscription } from 'rxjs';
import { TRADE_STATUS } from '@shared/models/swaps/trade-status';
import { SdkService } from '@core/services/sdk/sdk.service';
import { SwapFormService } from '@core/services/swaps/swap-form.service';
import {
  BLOCKCHAIN_NAME,
  BlockchainName,
  BlockchainsInfo,
  EvmBlockchainName,
  EvmWeb3Pure,
  limitOrderSupportedBlockchains,
  TokenAmount as SdkTokenAmount,
  TokenBaseStruct
} from 'rubic-sdk';
import { AvailableTokenAmount } from '@shared/models/tokens/available-token-amount';
import { compareTokens, switchIif, switchTap } from '@shared/utils/utils';
import { debounceTime, distinctUntilChanged, map, switchMap, tap } from 'rxjs/operators';
import { SwapTypeService } from '@core/services/swaps/swap-type.service';
import { SWAP_PROVIDER_TYPE } from '@features/swaps/features/swap-form/models/swap-provider-type';
import { AuthService } from '@core/services/auth/auth.service';
import { SwapFormInputTokens } from '@core/services/swaps/models/swap-form-tokens';
import { RubicError } from '@core/errors/models/rubic-error';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import { RubicSdkErrorParser } from '@core/errors/models/rubic-sdk-error-parser';
import { NotificationsService } from '@core/services/notifications/notifications.service';
import { ErrorsService } from '@core/errors/errors.service';
import { BasicTransactionOptions } from 'rubic-sdk/lib/core/blockchain/web3-private-service/web3-private/models/basic-transaction-options';
import { OrderExpirationService } from '@features/swaps/features/limit-order/services/order-expiration.service';
import { OrderRateService } from '@features/swaps/features/limit-order/services/order-rate.service';
import { SuccessTxModalService } from '@core/services/success-tx-modal-service/success-tx-modal.service';
import { UserRejectError } from '@core/errors/models/provider/user-reject-error';
import { UserRejectSigningError } from '@core/errors/models/provider/user-reject-signing-error';
import { SwapFormInput } from '@core/services/swaps/models/swap-form-controls';
import { SwapFormQueryService } from '@core/services/swaps/swap-form-query.service';
import { LimitOrdersApiService } from '@core/services/backend/limit-orders-api/limit-orders-api.service';
import { GasService } from '@core/services/gas-service/gas.service';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';

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

  private prevAddress = this.walletConnectorService.address;

  /**
   * Controls approve calculation flow.
   * When `next` is called, recalculation is started.
   */
  private readonly _calculateTrade$ = new Subject<{ stop?: boolean; force?: boolean }>();

  private calculating = false;

  private get isFormFilled(): boolean {
    const { fromAsset, fromAmount, toToken } = this.swapFormService.inputValue;
    const { toAmount } = this.swapFormService.outputValue;
    return fromAsset && fromAmount?.gt(0) && toToken && toAmount?.gt(0);
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
    private readonly swapFormQueryService: SwapFormQueryService,
    private readonly authService: AuthService,
    private readonly errorsService: ErrorsService,
    private readonly notificationsService: NotificationsService,
    private readonly orderExpirationService: OrderExpirationService,
    private readonly orderRateService: OrderRateService,
    private readonly successTxModalService: SuccessTxModalService,
    private readonly limitOrdersApiService: LimitOrdersApiService,
    private readonly gasService: GasService,
    protected readonly walletConnectorService: WalletConnectorService
  ) {
    this.subscribeOnCalculation();

    this.subscribeOnFormChanges();
    this.subscribeOnSwapTypeChanges();
    this.subscribeOnWalletChange();
  }

  /**
   * Subscribe on 'calculate' subject, which controls flow of calculation.
   * Can be called only once in constructor.
   */
  private subscribeOnCalculation(): void {
    this._calculateTrade$
      .pipe(
        debounceTime(200),
        switchMap(calculateData => {
          if (calculateData.stop) {
            return of(null);
          }

          const { fromBlockchain, fromToken, fromAmount } = this.inputValue;
          if (!fromAmount?.isFinite() || !fromToken) {
            return of(null);
          }

          const isUserAuthorized =
            Boolean(this.authService.userAddress) &&
            this.authService.userChainType === BlockchainsInfo.getChainType(fromBlockchain);
          if (!isUserAuthorized) {
            return of(null);
          }

          this.calculating = true;
          if (this.isFormFilled) {
            this.tradeStatus = TRADE_STATUS.LOADING;
          } else {
            this.tradeStatus = TRADE_STATUS.DISABLED;
          }

          return from(
            SdkTokenAmount.createToken({
              ...(fromToken as TokenBaseStruct<EvmBlockchainName>),
              tokenAmount: fromAmount
            })
          ).pipe(
            switchIif(
              fromTokenAmount => {
                return (
                  !this.prevFromTokenAmount ||
                  !compareTokens(this.prevFromTokenAmount, fromTokenAmount) ||
                  !this.prevFromTokenAmount.tokenAmount.eq(fromAmount) ||
                  calculateData?.force
                );
              },
              fromTokenAmount => {
                return from(
                  this.sdkService.limitOrderManager.needApprove(fromTokenAmount, fromAmount)
                ).pipe(
                  map(needApprove => {
                    this.prevFromTokenAmount = fromTokenAmount;
                    this.needApprove = needApprove;
                  })
                );
              },
              () => of(null)
            ),
            tap(() => {
              this.calculating = false;
              if (this.isFormFilled) {
                this.tradeStatus = this.needApprove
                  ? TRADE_STATUS.READY_TO_APPROVE
                  : TRADE_STATUS.READY_TO_SWAP;
              }
              this._displayApproveButton$.next(this.needApprove);
            })
          );
        })
      )
      .subscribe();
  }

  private subscribeOnWalletChange(): void {
    this.walletConnectorService.addressChange$
      .pipe(switchTap(() => from(this.updateStatus({ force: true }))))
      .subscribe();
  }

  private subscribeOnFormChanges(): void {
    this.swapFormService.inputValueDistinct$.subscribe(() => {
      this.updateStatus();
      setTimeout(() => this.updateBlockchains());
    });

    this.swapFormService.outputValueDistinct$.subscribe(() => {
      if (this.isFormFilled) {
        if (this.calculating) {
          this.tradeStatus = TRADE_STATUS.LOADING;
        } else {
          this.tradeStatus = this.needApprove
            ? TRADE_STATUS.READY_TO_APPROVE
            : TRADE_STATUS.READY_TO_SWAP;
        }
      } else {
        this.tradeStatus = TRADE_STATUS.DISABLED;
      }
    });
  }

  private subscribeOnSwapTypeChanges(): void {
    this.swapTypeService.swapMode$.pipe(distinctUntilChanged()).subscribe(() => {
      this.updateBlockchains();
    });
  }

  private async updateStatus(
    updateStatus: { stop?: boolean; force?: boolean } = {}
  ): Promise<void> {
    if (this.swapTypeService.getSwapProviderType() !== SWAP_PROVIDER_TYPE.LIMIT_ORDER) {
      return;
    }
    this._calculateTrade$.next(updateStatus);
  }

  /**
   * Updates form blockchains, so they are equal.
   */
  private updateBlockchains(): void {
    if (
      this.swapTypeService.getSwapProviderType() !== SWAP_PROVIDER_TYPE.LIMIT_ORDER ||
      this.swapFormQueryService.initialLoading
    ) {
      return;
    }

    let { fromToken, toToken, fromBlockchain, toBlockchain } = this.inputValue;
    if (!limitOrderSupportedBlockchains.some(el => el === fromBlockchain)) {
      fromBlockchain = BLOCKCHAIN_NAME.ETHEREUM;
      fromToken = null;
    } else if (EvmWeb3Pure.isNativeAddress(fromToken?.address)) {
      fromToken = null;
    }
    if (!limitOrderSupportedBlockchains.some(el => el === toBlockchain)) {
      toBlockchain = BLOCKCHAIN_NAME.ETHEREUM;
      toToken = null;
    } else if (EvmWeb3Pure.isNativeAddress(toToken?.address)) {
      toToken = null;
    }
    const inputValues: Partial<SwapFormInput> = {
      fromAssetType: fromBlockchain,
      toBlockchain,
      fromAsset: fromToken,
      toToken
    };

    if (fromBlockchain !== toBlockchain) {
      if (toToken && !fromToken) {
        this.swapFormService.inputControl.patchValue({
          ...inputValues,
          fromAssetType: toBlockchain
        });
      } else {
        this.swapFormService.inputControl.patchValue({
          ...inputValues,
          toBlockchain: fromBlockchain,
          fromAmount: null,
          toToken: null
        });
        this.swapFormService.outputControl.patchValue({
          toAmount: null
        });
      }
    } else {
      this.swapFormService.inputControl.patchValue(inputValues);
    }
  }

  public async approve(): Promise<void> {
    const { fromAsset, fromAmount } = this.swapFormService.inputValue;

    this.tradeStatus = TRADE_STATUS.APPROVE_IN_PROGRESS;

    let approveInProgressSubscription$: Subscription;

    try {
      const fromToken = fromAsset as TokenBaseStruct<EvmBlockchainName>;

      const { shouldCalculateGasPrice, gasPriceOptions } = await this.gasService.getGasInfo(
        fromToken.blockchain
      );

      const options: BasicTransactionOptions = {
        onTransactionHash: () => {
          approveInProgressSubscription$ = this.notificationsService.showApproveInProgress();
        },
        ...(shouldCalculateGasPrice && { gasPriceOptions })
      };

      await this.sdkService.limitOrderManager.approve(fromToken, fromAmount, options);
      this.notificationsService.showApproveSuccessful();

      this.tradeStatus = TRADE_STATUS.READY_TO_SWAP;
    } catch (error) {
      const parsedError = RubicSdkErrorParser.parseError(error);
      this.errorsService.catch(parsedError);

      this.tradeStatus = TRADE_STATUS.READY_TO_APPROVE;
    } finally {
      approveInProgressSubscription$?.unsubscribe();
    }
  }

  public async onCreateOrder(): Promise<void> {
    const inputForm = this.swapFormService.inputValue;
    const { fromAsset, fromAmount, toToken } = inputForm;
    const fromToken = fromAsset as AvailableTokenAmount;
    const { toAmount } = this.swapFormService.outputValue;

    this.tradeStatus = TRADE_STATUS.SWAP_IN_PROGRESS;
    try {
      const deadline = this.orderExpirationService.expirationTime;
      const hash = await this.sdkService.limitOrderManager.createOrder(
        fromToken as TokenBaseStruct<EvmBlockchainName>,
        toToken as TokenBaseStruct<EvmBlockchainName>,
        fromAmount,
        toAmount,
        { deadline }
      );

      this.limitOrdersApiService.createTrade(
        hash,
        inputForm,
        toAmount,
        this.authService.userAddress
      );
      this.successTxModalService.openLimitOrderModal();
    } catch (error) {
      let parsedError = RubicSdkErrorParser.parseError(error);
      if (parsedError instanceof UserRejectError) {
        parsedError = new UserRejectSigningError();
      }
      this.errorsService.catch(parsedError);
    }
    this.tradeStatus = TRADE_STATUS.READY_TO_SWAP;
  }
}
