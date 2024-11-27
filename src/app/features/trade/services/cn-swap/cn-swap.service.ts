import { Injectable } from '@angular/core';
import {
  CHANGENOW_API_STATUS,
  ChangenowApiStatus,
  ChangeNowCrossChainApiService,
  ChangenowPaymentInfo,
  RubicSdkError
} from 'rubic-sdk';
import { BehaviorSubject, interval } from 'rxjs';
import { SwapsFormService } from '@features/trade/services/swaps-form/swaps-form.service';
import { HttpClient } from '@angular/common/http';
import { skip, startWith, switchMap, takeWhile, tap } from 'rxjs/operators';
import { ChangenowPostTrade } from '@features/trade/models/cn-trade';
import { StoreService } from '@core/services/store/store.service';

@Injectable()
export class CnSwapService {
  private readonly maxLatestTrades = 8;

  public get changenowRecentTrades(): ChangenowPostTrade[] {
    return this.storeService.getItem('RUBIC_CHANGENOW_RECENT_TRADE') || [];
  }

  private readonly _cnTrade$ = new BehaviorSubject<ChangenowPostTrade | null>(null);

  public readonly cnTrade$ = this._cnTrade$.asObservable().pipe(skip(1));

  private readonly _status$ = new BehaviorSubject<ChangenowApiStatus>(CHANGENOW_API_STATUS.WAITING);

  public readonly status$ = this._status$.asObservable();

  constructor(
    private readonly swapsFormService: SwapsFormService,
    private readonly httpClient: HttpClient,
    private readonly storeService: StoreService
  ) {}

  public updateTrade(paymentInfo: ChangenowPaymentInfo, receiverAddress: string): void {
    const { fromToken, toToken, fromAmount } = this.swapsFormService.inputValue;
    const { toAmount } = this.swapsFormService.outputValue;

    const trade = {
      id: paymentInfo.id,

      fromToken,
      toToken,
      fromAmount: fromAmount.visibleValue,
      toAmount: toAmount.toFixed(),
      timestamp: Date.now(),

      depositAddress: paymentInfo.depositAddress,
      receiverAddress,
      extraField: paymentInfo.extraField
    };
    this._cnTrade$.next(trade);

    this.saveTrade(trade);
  }

  public async getChangenowSwapStatus(id: string): Promise<ChangenowApiStatus> {
    if (!id) {
      throw new RubicSdkError('Must provide changenow trade id');
    }

    try {
      const response = await ChangeNowCrossChainApiService.getTxStatus(id);

      return response.status as ChangenowApiStatus;
    } catch {
      return CHANGENOW_API_STATUS.WAITING;
    }
  }

  public setupUpdate(): void {
    interval(30000)
      .pipe(
        startWith(-1),
        switchMap(() => this.getChangenowSwapStatus(this._cnTrade$.value?.id)),
        tap(status => this._status$.next(status)),
        takeWhile(status => status !== CHANGENOW_API_STATUS.FINISHED)
      )
      .subscribe();
  }

  private saveTrade(tradeData: ChangenowPostTrade): void {
    const currentUsersTrades = [...(this.changenowRecentTrades || [])];

    if (currentUsersTrades?.length === this.maxLatestTrades) {
      currentUsersTrades.pop();
    }
    currentUsersTrades.unshift(tradeData);

    const updatedTrades = [...currentUsersTrades];

    this.storeService.setItem('RUBIC_CHANGENOW_RECENT_TRADE', updatedTrades);
  }
}
