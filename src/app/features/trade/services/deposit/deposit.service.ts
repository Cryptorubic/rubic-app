import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom, interval, Subscription } from 'rxjs';
import { SwapsFormService } from '@features/trade/services/swaps-form/swaps-form.service';
import { find, map, startWith, switchMap, takeWhile, tap } from 'rxjs/operators';
import { StoreService } from '@core/services/store/store.service';
import { PreviewSwapService } from '../preview-swap/preview-swap.service';
import { DepositTrade, DepositTradeType } from '../../models/deposit-trade';
import {
  API_STATUS_TO_DEPOSIT_STATUS,
  API_SUBSTATUS_TO_DEPOSIT_STATUS,
  CROSS_CHAIN_DEPOSIT_STATUS,
  CrossChainDepositData
} from '@app/core/services/sdk/sdk-legacy/features/cross-chain/calculation-manager/providers/common/cross-chain-transfer-trade/models/cross-chain-deposit-statuses';
import { CrossChainPaymentInfo } from '@app/core/services/sdk/sdk-legacy/features/cross-chain/calculation-manager/providers/common/cross-chain-transfer-trade/models/cross-chain-payment-info';
import { TokenAmountDirective } from '@app/shared/directives/token-amount/token-amount.directive';
import { RubicApiService } from '@app/core/services/sdk/sdk-legacy/rubic-api/rubic-api.service';
import {
  CLEARSWAP_STATUS,
  CLEARSWAP_SUB_STATUS
} from '@app/features/privacy/providers/clearswap/models/status';
import { TradeStatusService } from '@app/core/services/sdk/sdk-legacy/trade-status-service/trade-status.service';
import { isClearswap } from '@app/core/services/sdk/sdk-legacy/features/common/utils/is-clearswap';
import BigNumber from 'bignumber.js';
import { Token } from '@cryptorubic/core';

@Injectable()
export class DepositService {
  public readonly subs: Subscription[] = [];

  private readonly maxLatestTrades = 10;

  public get depositRecentTrades(): DepositTrade[] {
    return this.storeService.getItem('RUBIC_DEPOSIT_RECENT_TRADE') || [];
  }

  private readonly _depositTrade$ = new BehaviorSubject<DepositTrade | null>(null);

  public readonly depositTrade$ = this._depositTrade$.asObservable();

  private readonly _status$ = new BehaviorSubject<CrossChainDepositData>({
    status: CROSS_CHAIN_DEPOSIT_STATUS.WAITING,
    dstHash: null,
    toAmount: new BigNumber(0)
  });

  public readonly status$ = this._status$.asObservable();

  private readonly _exchangeTime$ = new BehaviorSubject<{
    startedAt: number;
    finishedAt: number;
  }>({ startedAt: 0, finishedAt: 0 });

  public readonly exchangeDuration$ = this._exchangeTime$.pipe(
    find(time => time.finishedAt > 0),
    map(time => time.finishedAt - time.startedAt)
  );

  public setExchangeStartTime(startedAt: number): void {
    this._exchangeTime$.next({ ...this._exchangeTime$.value, startedAt });
  }

  public setExchangeEndTime(finishedAt: number): void {
    this._exchangeTime$.next({ ...this._exchangeTime$.value, finishedAt });
  }

  constructor(
    private readonly swapsFormService: SwapsFormService,
    private readonly storeService: StoreService,
    private readonly previewSwapService: PreviewSwapService,
    private readonly rubicApiService: RubicApiService,
    private readonly tradeStatusService: TradeStatusService
  ) {}

  public cleanup(): void {
    this.subs.forEach(sub => sub.unsubscribe());
    this.removePrevDeposit();
  }

  public async updateTrade(
    paymentInfo: CrossChainPaymentInfo,
    receiverAddress: string
  ): Promise<void> {
    const { fromToken, toToken, fromAmount } = this.swapsFormService.inputValue;
    const selectedTrade = await firstValueFrom(this.previewSwapService.selectedTradeState$);
    if (!selectedTrade) return;

    const trade = {
      rubicId: selectedTrade.trade.rubicId,
      id: paymentInfo.id,

      fromToken,
      toToken,
      fromAmount: TokenAmountDirective.replaceCommas(fromAmount.visibleValue),
      toAmount: paymentInfo.toAmount,
      timestamp: Date.now(),

      depositAddress: paymentInfo.depositAddress,
      receiverAddress,
      extraField: paymentInfo.extraField,
      tradeType: selectedTrade.tradeType as DepositTradeType
    };
    this._depositTrade$.next(trade);

    this.saveTrade(trade);
  }

  public setupUpdate(): void {
    const sub = interval(5_000)
      .pipe(
        startWith(-1),
        switchMap(() => this.getSwapStatus(this._depositTrade$.value?.rubicId)),
        tap(status => this._status$.next(status)),
        tap(status => {
          if (status.status !== CROSS_CHAIN_DEPOSIT_STATUS.WAITING) {
            if (!this._exchangeTime$.value.startedAt) {
              this.setExchangeStartTime(Date.now());
            }
          }
          if (status.status === CROSS_CHAIN_DEPOSIT_STATUS.FINISHED) {
            this.setExchangeEndTime(Date.now());
          }
        }),
        takeWhile(
          status =>
            status.status !== CROSS_CHAIN_DEPOSIT_STATUS.FINISHED &&
            status.status !== CROSS_CHAIN_DEPOSIT_STATUS.FAILED
        )
      )
      .subscribe();

    this.subs.push(sub);
  }

  public removePrevDeposit(): void {
    this._depositTrade$.next(null);
    this._status$.next({
      status: CROSS_CHAIN_DEPOSIT_STATUS.WAITING,
      dstHash: null,
      toAmount: new BigNumber(0)
    });
  }

  private async getSwapStatus(rubicId: string): Promise<CrossChainDepositData> {
    try {
      if (!rubicId) {
        throw new Error(`[DepositService_getSwapStatus] Deposit id can't be undefined.`);
      }

      const depositTrade = this._depositTrade$.value;
      const tradeType = depositTrade?.tradeType;
      if (isClearswap(tradeType)) {
        return this.getClearswapDepositStatus(rubicId);
      }

      const response = await this.rubicApiService.fetchCrossChainTxStatusExtended(rubicId);
      const toAmount = response.toAmount
        ? new BigNumber(response.toAmount)
        : response.toAmountWei
          ? Token.fromWei(response.toAmountWei, depositTrade.toToken.decimals)
          : this._depositTrade$.value.toAmount;

      if (response.status === 'SUCCESS') {
        return {
          status: CROSS_CHAIN_DEPOSIT_STATUS.FINISHED,
          dstHash: response.destinationTxHash,
          toAmount
        };
      }

      if (!response.subStatus) {
        return { status: API_STATUS_TO_DEPOSIT_STATUS[response.status], dstHash: null, toAmount };
      }

      return {
        status: API_SUBSTATUS_TO_DEPOSIT_STATUS[response.subStatus],
        dstHash: null,
        toAmount
      };
    } catch (err) {
      console.log(err);
      return {
        status: CROSS_CHAIN_DEPOSIT_STATUS.WAITING,
        dstHash: null,
        toAmount: this._depositTrade$.value.toAmount
      };
    }
  }

  private async getClearswapDepositStatus(rubicId: string): Promise<CrossChainDepositData> {
    const response = await this.tradeStatusService.getClearswapStatus(rubicId);

    const depositTrade = this._depositTrade$.value;
    const toAmount = response.toAmount
      ? new BigNumber(response.toAmount)
      : response.toAmountWei
        ? Token.fromWei(response.toAmountWei, depositTrade.toToken.decimals)
        : this._depositTrade$.value.toAmount;

    if (response.status === CLEARSWAP_STATUS.SUCCESS) {
      return {
        status: CROSS_CHAIN_DEPOSIT_STATUS.FINISHED,
        dstHash: response.destTxHash,
        toAmount
      };
    }
    if (response.status === CLEARSWAP_STATUS.PENDING) {
      const subStatusValidValues: (keyof typeof API_SUBSTATUS_TO_DEPOSIT_STATUS)[] = [
        CLEARSWAP_SUB_STATUS.AWAITING_DEPOSIT,
        CLEARSWAP_SUB_STATUS.CONFIRMING,
        CLEARSWAP_SUB_STATUS.PENDING,
        CLEARSWAP_SUB_STATUS.HIDING,
        CLEARSWAP_SUB_STATUS.SENDING
      ];
      if (subStatusValidValues.some(s => s === response.subStatus)) {
        return {
          status:
            API_SUBSTATUS_TO_DEPOSIT_STATUS[
              response.subStatus as keyof typeof API_SUBSTATUS_TO_DEPOSIT_STATUS
            ],
          dstHash: null,
          toAmount
        };
      }

      return { status: CROSS_CHAIN_DEPOSIT_STATUS.WAITING, dstHash: null, toAmount };
    }

    return { status: CROSS_CHAIN_DEPOSIT_STATUS.FAILED, dstHash: null, toAmount };
  }

  private saveTrade(tradeData: DepositTrade): void {
    const currentUsersTrades = [...(this.depositRecentTrades || [])];

    if (currentUsersTrades?.length === this.maxLatestTrades) {
      currentUsersTrades.pop();
    }
    currentUsersTrades.unshift(tradeData);

    const updatedTrades = [...currentUsersTrades];

    this.storeService.setItem('RUBIC_DEPOSIT_RECENT_TRADE', updatedTrades);
  }
}
