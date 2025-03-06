import { Injectable } from '@angular/core';
import {
  CROSS_CHAIN_DEPOSIT_STATUS,
  CrossChainDepositStatus,
  CrossChainPaymentInfo,
  getDepositStatus
} from 'rubic-sdk';
import { BehaviorSubject, firstValueFrom, interval } from 'rxjs';
import { SwapsFormService } from '@features/trade/services/swaps-form/swaps-form.service';
import { skip, startWith, switchMap, takeWhile, tap } from 'rxjs/operators';
import { StoreService } from '@core/services/store/store.service';
import { PreviewSwapService } from '../preview-swap/preview-swap.service';
import { CrossChainTransferTrade } from '../../models/cn-trade';

@Injectable()
export class DepositService {
  private readonly maxLatestTrades = 10;

  public get depositRecentTrades(): CrossChainTransferTrade[] {
    return this.storeService.getItem('RUBIC_DEPOSIT_RECENT_TRADE') || [];
  }

  private readonly _depositTrade$ = new BehaviorSubject<CrossChainTransferTrade | null>(null);

  public readonly depositTrade$ = this._depositTrade$.asObservable().pipe(skip(1));

  private readonly _status$ = new BehaviorSubject<CrossChainDepositStatus>(
    CROSS_CHAIN_DEPOSIT_STATUS.WAITING
  );

  public readonly status$ = this._status$.asObservable();

  constructor(
    private readonly swapsFormService: SwapsFormService,
    private readonly storeService: StoreService,
    private readonly previewSwapService: PreviewSwapService
  ) {}

  public async updateTrade(
    paymentInfo: CrossChainPaymentInfo,
    receiverAddress: string
  ): Promise<void> {
    const { fromToken, toToken, fromAmount } = this.swapsFormService.inputValue;
    const selectedTrade = await firstValueFrom(this.previewSwapService.selectedTradeState$);
    const trade = {
      id: paymentInfo.id,

      fromToken,
      toToken,
      fromAmount: fromAmount.visibleValue,
      toAmount: paymentInfo.toAmount,
      timestamp: Date.now(),

      depositAddress: paymentInfo.depositAddress,
      receiverAddress,
      extraField: paymentInfo.extraField,
      tradeType: selectedTrade.tradeType
    };
    this._depositTrade$.next(trade);

    this.saveTrade(trade);
  }

  public async getSwapStatus(id: string): Promise<CrossChainDepositStatus> {
    try {
      if (!id) {
        throw new Error();
      }
      const trade = await firstValueFrom(this.previewSwapService.selectedTradeState$);
      const response = await getDepositStatus(id, trade.tradeType);

      return response.status;
    } catch {
      return CROSS_CHAIN_DEPOSIT_STATUS.WAITING;
    }
  }

  public setupUpdate(): void {
    interval(30000)
      .pipe(
        startWith(-1),
        switchMap(() => this.getSwapStatus(this._depositTrade$.value?.id)),
        tap(status => this._status$.next(status)),
        takeWhile(status => status !== CROSS_CHAIN_DEPOSIT_STATUS.FINISHED)
      )
      .subscribe();
  }

  public removePrevDeposit(): void {
    this._depositTrade$.next(null);
  }

  private saveTrade(tradeData: CrossChainTransferTrade): void {
    const currentUsersTrades = [...(this.depositRecentTrades || [])];

    if (currentUsersTrades?.length === this.maxLatestTrades) {
      currentUsersTrades.pop();
    }
    currentUsersTrades.unshift(tradeData);

    const updatedTrades = [...currentUsersTrades];

    this.storeService.setItem('RUBIC_DEPOSIT_RECENT_TRADE', updatedTrades);
  }
}
