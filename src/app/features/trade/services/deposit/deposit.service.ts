import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom, interval, Subscription } from 'rxjs';
import { SwapsFormService } from '@features/trade/services/swaps-form/swaps-form.service';
import { skip, startWith, switchMap, takeWhile, tap } from 'rxjs/operators';
import { StoreService } from '@core/services/store/store.service';
import { PreviewSwapService } from '../preview-swap/preview-swap.service';
import { CrossChainTransferTrade } from '../../models/cn-trade';
import {
  API_STATUS_TO_DEPOSIT_STATUS,
  CROSS_CHAIN_DEPOSIT_STATUS,
  CrossChainDepositStatus
} from '@app/core/services/sdk/sdk-legacy/features/cross-chain/calculation-manager/providers/common/cross-chain-transfer-trade/models/cross-chain-deposit-statuses';
import { CrossChainPaymentInfo } from '@app/core/services/sdk/sdk-legacy/features/cross-chain/calculation-manager/providers/common/cross-chain-transfer-trade/models/cross-chain-payment-info';
import { TokenAmountDirective } from '@app/shared/directives/token-amount/token-amount.directive';
import { RubicApiService } from '@app/core/services/sdk/sdk-legacy/rubic-api/rubic-api.service';
import { TransferTradeType } from '@app/core/services/sdk/sdk-legacy/features/cross-chain/calculation-manager/providers/common/cross-chain-transfer-trade/constans/transfer-trade-supported-providers';
import { CrossChainTradeType, OnChainTradeType } from '@cryptorubic/core';
import { BRIDGE_PROVIDERS } from '../../constants/bridge-providers';
import { NotificationsService } from '@app/core/services/notifications/notifications.service';

@Injectable()
export class DepositService {
  public readonly subs: Subscription[] = [];

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
    private readonly rubicApiService: RubicApiService,
    private readonly notificationsService: NotificationsService
  ) {}

  public async updateTrade(
    paymentInfo: CrossChainPaymentInfo,
    receiverAddress: string
  ): Promise<void> {
    const { fromToken, toToken, fromAmount } = this.swapsFormService.inputValue;
    const selectedTrade = await firstValueFrom(this.previewSwapService.selectedTradeState$);

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
      tradeType: selectedTrade.tradeType as TransferTradeType
    };
    this._depositTrade$.next(trade);

    this.saveTrade(trade);
  }

  public async getSwapStatus(rubicId: string): Promise<CrossChainDepositStatus> {
    try {
      if (!rubicId) {
        throw new Error(`[DepositService_getSwapStatus] Deposid id can't be undefined.`);
      }

      const response = await this.rubicApiService.fetchCrossChainTxStatusExtended(rubicId);

      return API_STATUS_TO_DEPOSIT_STATUS[response.status];
    } catch (err) {
      console.log(err);
      return CROSS_CHAIN_DEPOSIT_STATUS.WAITING;
    }
  }

  public setupUpdate(): void {
    const sub = interval(30000)
      .pipe(
        startWith(-1),
        switchMap(() => this.getSwapStatus(this._depositTrade$.value?.rubicId)),
        tap(status => this._status$.next(status)),
        takeWhile(status => status !== CROSS_CHAIN_DEPOSIT_STATUS.FINISHED)
      )
      .subscribe();

    this.subs.push(sub);
  }

  public removePrevDeposit(): void {
    this._depositTrade$.next(null);
  }

  public subscribeOnSelectedTrade(): void {
    const sub = this.previewSwapService.selectedTradeState$
      .pipe(tap(trade => this.showDepositProviderHint(trade?.tradeType)))
      .subscribe();

    this.subs.push(sub);
  }

  private showDepositProviderHint(
    tradeType: CrossChainTradeType | OnChainTradeType | undefined
  ): void {
    if (!tradeType) return;

    const msg = `If you are using a smart account, please be aware that ${this.getProviderName(
      tradeType
    )} may not recognise your transaction correctly. You can choose another best option.`;
    this.notificationsService.showInfo(msg);
  }

  private getProviderName(tradeType: CrossChainTradeType | OnChainTradeType): string {
    const provider = BRIDGE_PROVIDERS[tradeType as CrossChainTradeType];
    return provider.name || 'unknown';
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
