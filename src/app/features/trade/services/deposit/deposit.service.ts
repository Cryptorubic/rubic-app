import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom, interval } from 'rxjs';
import { SwapsFormService } from '@features/trade/services/swaps-form/swaps-form.service';
import { skip, startWith, switchMap, takeWhile, tap } from 'rxjs/operators';
import { StoreService } from '@core/services/store/store.service';
import { PreviewSwapService } from '../preview-swap/preview-swap.service';
import { CrossChainTransferTrade } from '../../models/cn-trade';
import {
  CROSS_CHAIN_DEPOSIT_STATUS,
  CrossChainDepositStatus
} from '@app/core/services/sdk/sdk-legacy/features/cross-chain/calculation-manager/providers/common/cross-chain-transfer-trade/models/cross-chain-deposit-statuses';
import { CrossChainPaymentInfo } from '@app/core/services/sdk/sdk-legacy/features/cross-chain/calculation-manager/providers/common/cross-chain-transfer-trade/models/cross-chain-payment-info';
import { getDepositStatus } from '@app/core/services/sdk/sdk-legacy/features/cross-chain/calculation-manager/providers/common/cross-chain-transfer-trade/utils/get-deposit-status';
import { HttpClient } from '@angular/common/http';

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
    private readonly previewSwapService: PreviewSwapService,
    private readonly httpClient: HttpClient
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
      const response = await getDepositStatus(
        id,
        trade.tradeType,
        {
          depositMemo: this._depositTrade$.value.extraField?.value
        },
        this.httpClient
      );

      return response.status;
    } catch (err) {
      console.log('[DepositService_getSwapStatus] err ==>', err);
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
