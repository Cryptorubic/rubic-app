import { Injectable } from '@angular/core';
import { ChangenowPostTrade } from '@features/swaps/core/services/changenow-post-trade-service/models/changenow-post-trade';
import { StoreService } from '@core/services/store/store.service';
import {
  changenowApiKey,
  ChangenowApiResponse,
  ChangenowApiStatus,
  ChangenowPaymentInfo,
  RubicSdkError
} from 'rubic-sdk';
import { SwapFormService } from '@core/services/swaps/swap-form.service';
import { Token } from '@app/shared/models/tokens/token';
import { BehaviorSubject, firstValueFrom, interval } from 'rxjs';
import { startWith, switchMap, takeWhile, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class ChangenowPostTradeService {
  public trade: ChangenowPostTrade | undefined;

  private readonly _status$ = new BehaviorSubject<ChangenowApiStatus>(ChangenowApiStatus.WAITING);

  public readonly status$ = this._status$.asObservable();

  constructor(
    private readonly storeService: StoreService,
    private readonly swapFormService: SwapFormService,
    private readonly httpClient: HttpClient
  ) {
    this.trade = this.storeService.getItem('changenowPostTrade');
  }

  public updateTrade(paymentInfo: ChangenowPaymentInfo, receiverAddress: string): void {
    const { fromAsset, toToken, fromAmount } = this.swapFormService.inputValue;
    const { toAmount } = this.swapFormService.outputValue;

    this.trade = {
      id: paymentInfo.id,

      fromToken: fromAsset as Token,
      toToken,
      fromAmount: fromAmount.toFixed(),
      toAmount: toAmount.toFixed(),

      depositAddress: paymentInfo.depositAddress,
      receiverAddress,

      extraField: paymentInfo.extraField
    };
    this.storeService.setItem('changenowPostTrade', this.trade);
  }

  private async getChangenowSwapStatus(id: string): Promise<ChangenowApiStatus> {
    if (!id) {
      throw new RubicSdkError('Must provide changenow trade id');
    }

    try {
      const responce = await firstValueFrom(
        this.httpClient.get<ChangenowApiResponse>('https://api.changenow.io/v2/exchange/by-id', {
          params: { id: id },
          headers: { 'x-changenow-api-key': changenowApiKey }
        })
      );

      return responce.status;
    } catch {
      return ChangenowApiStatus.WAITING;
    }
  }

  public setupUpdate(): void {
    interval(30000)
      .pipe(
        startWith(-1),
        switchMap(() => this.getChangenowSwapStatus(this.trade.id)),
        tap(status => {
          this._status$.next(status);
          console.log('Status trx: ', status);
        }),
        takeWhile(status => status === ChangenowApiStatus.FINISHED)
      )
      .subscribe();
  }
}
