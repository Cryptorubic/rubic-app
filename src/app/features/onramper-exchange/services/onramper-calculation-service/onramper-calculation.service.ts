import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { onramperApiKey } from '@features/onramper-exchange/constants/onramper-api-key';
import { OnramperRateResponse } from '@features/onramper-exchange/services/onramper-calculation-service/models/onramper-rate-response';
import { BehaviorSubject, firstValueFrom, of, switchMap } from 'rxjs';
import BigNumber from 'bignumber.js';
import { ExchangerFormService } from '@features/onramper-exchange/services/exchanger-form-service/exchanger-form.service';
import { ExchangerFormInput } from '@features/onramper-exchange/services/exchanger-form-service/models/exchanger-form';
import { EvmWeb3Pure, OnChainTrade } from 'rubic-sdk';
import { RubicSdkService } from '@features/swaps/core/services/rubic-sdk-service/rubic-sdk.service';
import { debounceTime } from 'rxjs/operators';
import { cryptoCode } from '@features/onramper-exchange/components/onramper-exchanger/components/onramper-widget/constants/crypto-code';

@Injectable({
  providedIn: 'root'
})
export class OnramperCalculationService {
  private readonly _loading$ = new BehaviorSubject<boolean>(false);

  public readonly loading$ = this._loading$.asObservable();

  private readonly _error$ = new BehaviorSubject<boolean>(false);

  public readonly error$ = this._error$.asObservable();

  constructor(
    private readonly httpClient: HttpClient,
    private readonly exchangerFormService: ExchangerFormService,
    private readonly sdkService: RubicSdkService
  ) {
    this.exchangerFormService.input$
      .pipe(
        debounceTime(200),
        switchMap(input => {
          if (input.fromFiat && input.toToken && input.fromAmount?.isFinite()) {
            this._loading$.next(true);
            return this.setOutputTokenAmount(input).then(() => {
              this._loading$.next(false);
            });
          } else {
            this.exchangerFormService.output.patchValue({
              toAmount: null
            });
            return of(null);
          }
        })
      )
      .subscribe();
  }

  private async setOutputTokenAmount(input: ExchangerFormInput): Promise<void> {
    this._error$.next(false);
    try {
      const receivedNativeAmount = await this.getOutputNativeAmount(input);
      if (EvmWeb3Pure.isNativeAddress(input.toToken.address)) {
        this.exchangerFormService.output.patchValue({
          toAmount: receivedNativeAmount
        });
        return;
      }

      const onChainTrades = await this.sdkService.instantTrade.calculateTrade(
        {
          address: EvmWeb3Pure.nativeTokenAddress,
          blockchain: input.toToken.blockchain
        },
        receivedNativeAmount.toFixed(),
        input.toToken.address,
        {
          gasCalculation: 'disabled'
        }
      );
      const bestTrade = onChainTrades[onChainTrades.length - 1];
      if (bestTrade instanceof OnChainTrade) {
        this.exchangerFormService.output.patchValue({
          toAmount: bestTrade.to.tokenAmount
        });
      } else {
        this._error$.next(true);
      }
    } catch {
      this.exchangerFormService.output.patchValue({
        toAmount: null
      });
      this._error$.next(true);
    }
  }

  private async getOutputNativeAmount(input: ExchangerFormInput): Promise<BigNumber> {
    const fromFiat = input.fromFiat.name;
    const toCrypto = cryptoCode[input.toToken.blockchain as keyof typeof cryptoCode];
    const fromAmount = input.fromAmount.toFixed();

    const trades = await firstValueFrom(
      this.httpClient.get<OnramperRateResponse>(
        `https://onramper.tech/rate/${fromFiat}/${toCrypto}/creditCard/${fromAmount}`,
        {
          headers: { Authorization: `Basic ${onramperApiKey}` }
        }
      )
    );
    const bestTrade = trades
      .filter(trade => trade.available)
      .sort((a, b) => {
        if (a.receivedCrypto === b.receivedCrypto) {
          return 0;
        }
        return a.receivedCrypto > b.receivedCrypto ? -1 : 1;
      })[0];
    if (!bestTrade?.receivedCrypto) {
      return new BigNumber(NaN);
    }
    return new BigNumber(bestTrade.receivedCrypto);
  }
}
