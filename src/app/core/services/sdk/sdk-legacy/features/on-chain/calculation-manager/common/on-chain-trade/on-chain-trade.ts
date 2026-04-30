import {
  BLOCKCHAIN_NAME,
  BlockchainName,
  ErrorInterface,
  Cache as Memo,
  OnChainTradeType,
  PriceTokenAmount,
  QuoteResponseInterface,
  SwapRequestInterface
} from '@cryptorubic/core';
import BigNumber from 'bignumber.js';
import { EncodeTransactionOptions } from '../../../../common/models/encode-transaction-options';
import { SwapTransactionOptions } from '../../../../common/models/swap-transaction-options';
import { isAddressCorrect } from '../../../../common/utils/check-address';
import { FeeInfo } from '../../../../cross-chain/calculation-manager/providers/common/models/fee-info';
import { RubicStep } from '../../../../cross-chain/calculation-manager/providers/common/models/rubicStep';
import { TradeInfo } from '../../../../cross-chain/calculation-manager/providers/common/models/trade-info';
import { SwapResponseInterface } from '../../../../ws-api/models/swap-response-interface';
import { SdkLegacyService } from '@app/core/services/sdk/sdk-legacy/sdk-legacy.service';
import {
  AbstractAdapter,
  BasicSendTransactionOptions,
  isApprovableAdapter,
  RubicSdkError,
  TradeExpiredError,
  UpdatedRatesError,
  WalletNotConnectedError,
  WrongFromAddressError,
  WrongReceiverAddressError
} from '@cryptorubic/web3';
import { HttpClient } from '@angular/common/http';
import { RubicApiService } from '@app/core/services/sdk/sdk-legacy/rubic-api/rubic-api.service';
import { RubicAny } from '@app/shared/models/utility-types/rubic-any';

/**
 * Abstract class for all instant trade providers' trades.
 */
export abstract class OnChainTrade<T = unknown> {
  /**
   * Token to sell with input amount.
   */
  public abstract readonly from: PriceTokenAmount;

  /**
   * Token to get with output amount.
   */
  public abstract readonly to: PriceTokenAmount;

  public abstract readonly slippageTolerance: number;

  protected abstract readonly spenderAddress: string; // not static because https://github.com/microsoft/TypeScript/issues/34516

  public abstract readonly path: RubicStep[];

  public abstract readonly feeInfo: FeeInfo;

  private _apiFromAddress: string | null = null;

  public set apiFromAddress(value: string | null) {
    this._apiFromAddress = value;
  }

  protected _lastTo: PriceTokenAmount | null = null;

  /*
   * use to check latest recalculated output-token amount
   */
  public get lastTo(): PriceTokenAmount {
    if (!this._lastTo) {
      throw new RubicSdkError('_lastTo field is unavailable before swap() method call.');
    }
    return this._lastTo;
  }

  /**
   * Type of instant trade provider.
   */
  public abstract get type(): OnChainTradeType;

  /**
   * Minimum amount of output token user can get.
   */
  public get toTokenAmountMin(): PriceTokenAmount {
    const weiAmountOutMin = this.to.weiAmountMinusSlippage(this.slippageTolerance);
    return new PriceTokenAmount({ ...this.to.asStructWithPrice, weiAmount: weiAmountOutMin });
  }

  // protected get web3Public(): Web3Public {
  //   return Injector.web3PublicService.getWeb3Public(this.from.blockchain);
  // }

  // protected get web3Private(): Web3Private {
  //   return Injector.web3PrivateService.getWeb3PrivateByBlockchain(this.from.blockchain);
  // }

  protected get chainAdapter(): AbstractAdapter<RubicAny, RubicAny, BlockchainName, {}, {}> {
    return this.sdkLegacyService.adaptersFactoryService.getAdapter(
      this.from.blockchain as RubicAny
    );
  }

  protected get walletAddress(): string {
    return this._apiFromAddress ?? this.chainAdapter.signer.walletAddress;
  }

  protected get httpClient(): HttpClient {
    return this.sdkLegacyService.httpClient;
  }

  /**
   * Price impact, based on tokens' usd prices.
   */
  @Memo
  public get priceImpact(): number | null {
    return this.from.calculatePriceImpactPercent(this.to);
  }

  public lastSwapResponse: SwapResponseInterface<T> | null = null;

  public readonly rubicId: string;

  public readonly warnings: ErrorInterface[];

  protected constructor(
    apiResponse: QuoteResponseInterface,
    protected readonly sdkLegacyService: SdkLegacyService,
    private readonly rubicApiService: RubicApiService
  ) {
    this.rubicId = apiResponse.id;
    this.warnings = apiResponse.warnings;
  }

  /**
   * Returns true, if allowance is not enough.
   */
  public async needApprove(fromAddress?: string): Promise<boolean> {
    if (!fromAddress) {
      this.checkWalletConnected();
    }

    if (!isApprovableAdapter(this.chainAdapter)) {
      return false;
    }

    // Native coin in METIS can be Token required approve
    if (this.from.isNative && this.from.blockchain !== BLOCKCHAIN_NAME.METIS) {
      return false;
    }

    // Special native address for METIS native coin
    const fromTokenAddress =
      this.from.isNative && this.from.blockchain === BLOCKCHAIN_NAME.METIS
        ? '0xdeaddeaddeaddeaddeaddeaddeaddeaddead0000'
        : this.from.address;

    const allowance = await this.chainAdapter.getAllowance(
      fromTokenAddress,
      fromAddress || this.walletAddress,
      this.spenderAddress
    );
    return allowance.allowanceWei.lt(this.from.weiAmount);
  }

  /**
   * Sends approve transaction with connected wallet.
   * @param options Transaction options.
   * @param checkNeedApprove If true, first allowance is checked.
   * @param amount Amount of tokens in approval window in spending cap field
   */
  public abstract approve(
    options: BasicSendTransactionOptions,
    checkNeedApprove: boolean,
    weiAmount: BigNumber
  ): Promise<unknown>;

  /**
   * Sends swap transaction with connected wallet.
   * If user has not enough allowance, then approve transaction will be called first.
   *
   * @example
   * ```ts
   * const onConfirm = (hash: string) => console.log(hash);
   * const receipt = await trades[TRADE_TYPE.UNISWAP_V2].swap({ onConfirm });
   * ```
   *
   * @param options Transaction options.
   */
  public abstract swap(options?: SwapTransactionOptions): Promise<string | never>;

  /**
   * Builds transaction config, with encoded data.
   * @param options Encode transaction options.
   */
  public abstract encode(options: EncodeTransactionOptions): Promise<unknown>;

  protected async checkWalletState(testMode = false): Promise<void> {
    this.checkWalletConnected();
    await this.checkBlockchainCorrect();
    if (!testMode) {
      await this.checkBalance();
    }
  }

  protected checkWalletConnected(): never | void {
    if (!this.walletAddress) {
      throw new WalletNotConnectedError();
    }
  }

  protected async checkBlockchainCorrect(): Promise<void | never> {
    await this.chainAdapter.signer.checkBlockchainCorrect(this.from.blockchain);
  }

  protected async checkBalance(): Promise<void | never> {
    await this.chainAdapter.checkBalance(this.from, this.from.tokenAmount, this.walletAddress);
  }

  protected async checkFromAddress(
    fromAddress: string | undefined,
    isRequired = false,
    chainType?: OnChainTradeType
  ): Promise<void | never> {
    if (!fromAddress) {
      if (isRequired) {
        throw new RubicSdkError(`'fromAddress' is required option`);
      }
      return;
    }

    const isAddressCorrectValue = await isAddressCorrect(
      fromAddress,
      this.from.blockchain,
      this.httpClient,
      chainType
    );

    if (!isAddressCorrectValue) {
      throw new WrongFromAddressError();
    }
  }

  protected async checkReceiverAddress(
    receiverAddress: string | undefined,
    isRequired = false,
    chainType?: OnChainTradeType
  ): Promise<void | never> {
    if (!receiverAddress) {
      if (isRequired) {
        throw new RubicSdkError(`'receiverAddress' is required option`);
      }
      return;
    }

    const isAddressCorrectValue = await isAddressCorrect(
      receiverAddress,
      this.from.blockchain,
      this.httpClient,
      chainType
    );

    if (!isAddressCorrectValue) {
      throw new WrongReceiverAddressError();
    }
  }

  public getTradeInfo(): TradeInfo {
    return {
      estimatedGas: null,
      feeInfo: this.feeInfo,
      priceImpact: this.priceImpact ?? null,
      slippage: this.slippageTolerance * 100,
      routePath: this.path
    };
  }

  protected checkAmountChange(newWeiAmount: string, oldWeiAmount: string): void {
    const oldAmount = new BigNumber(oldWeiAmount);
    const newAmount = new BigNumber(newWeiAmount);
    const changePercent = 0.5;
    const acceptablePercentPriceChange = new BigNumber(changePercent).dividedBy(100);

    const amountPlusPercent = oldAmount.multipliedBy(acceptablePercentPriceChange.plus(1));
    const amountMinusPercent = oldAmount.multipliedBy(
      new BigNumber(1).minus(acceptablePercentPriceChange)
    );

    const shouldThrowError = newAmount.lt(amountMinusPercent) || newAmount.gt(amountPlusPercent);

    if (shouldThrowError) {
      throw new UpdatedRatesError(oldWeiAmount, newWeiAmount);
    }
  }

  protected async fetchSwapData<Data>(
    body: SwapRequestInterface
  ): Promise<SwapResponseInterface<Data>> {
    try {
      const res = await this.rubicApiService.fetchSwapData<Data>(body);
      this.lastSwapResponse = res as RubicAny;
      return res;
    } catch (err) {
      if (err instanceof TradeExpiredError) {
        return this.refetchTrade<Data>(body);
      }

      throw err;
    }
  }

  private refetchTrade<Data>(body: SwapRequestInterface): Promise<SwapResponseInterface<Data>> {
    const res = this.rubicApiService.fetchBestSwapData<Data>({
      ...body,
      preferredProvider: this.type
    });
    this.lastSwapResponse = res as RubicAny;
    return res;
  }
}
