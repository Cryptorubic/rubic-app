import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, firstValueFrom, of, switchMap } from 'rxjs';
import BigNumber from 'bignumber.js';
import { EvmWeb3Pure, OnChainTrade } from 'rubic-sdk';
import { RubicSdkService } from '@features/swaps/core/services/rubic-sdk-service/rubic-sdk.service';
import { debounceTime } from 'rxjs/operators';
import { WINDOW } from '@ng-web-apis/common';
import { RubicError } from '@core/errors/models/rubic-error';
import { SwapFormService } from '@features/swaps/core/services/swap-form-service/swap-form.service';
import { cryptoCode } from '@features/swaps/features/onramper-exchange/components/onramper-widget/constants/crypto-code';
import { OnramperRateResponse } from '@features/swaps/features/onramper-exchange/services/onramper-calculation-service/models/onramper-rate-response';
import { onramperApiKey } from '@features/swaps/features/onramper-exchange/constants/onramper-api-key';
import { SwapFormInputFiats } from '@features/swaps/core/services/swap-form-service/models/swap-form-fiats';

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
    private readonly swapFormService: SwapFormService,
    private readonly sdkService: RubicSdkService,
    @Inject(WINDOW) private readonly window: Window
  ) {
    this.subscribeOnInputFormChange();
  }

  private subscribeOnInputFormChange(): void {
    this.swapFormService.inputValue$
      .pipe(
        debounceTime(200),
        switchMap(input => {
          if (input.fromAssetType === 'fiat' && this.swapFormService.isFilled) {
            this._loading$.next(true);
            this._error$.next(false);
            return this.getOutputTokenAmount(input as SwapFormInputFiats).catch(() => {
              this._error$.next(true);
              return null;
            });
          } else {
            return of(null);
          }
        })
      )
      .subscribe(toAmount => {
        this.swapFormService.outputControl.patchValue({
          toAmount
        });
        this._loading$.next(false);
      });
  }

  private async getOutputTokenAmount(input: SwapFormInputFiats): Promise<BigNumber | null> {
    const receivedNativeAmount = await this.getOutputNativeAmount(input);
    if (EvmWeb3Pure.isNativeAddress(input.toToken.address)) {
      return receivedNativeAmount;
    }

    const onChainTrades = await this.sdkService.instantTrade.calculateTrade(
      {
        address: EvmWeb3Pure.nativeTokenAddress,
        blockchain: input.toToken.blockchain
      },
      receivedNativeAmount.minus(0.01).toFixed(),
      input.toToken.address,
      {
        gasCalculation: 'disabled'
      }
    );
    const bestTrade = onChainTrades[onChainTrades.length - 1];
    if (bestTrade instanceof OnChainTrade) {
      return bestTrade.to.tokenAmount;
    } else {
      throw new RubicError('No on-chain trade');
    }
  }

  private async getOutputNativeAmount(input: SwapFormInputFiats): Promise<BigNumber> {
    const fromFiat = input.fromAsset.symbol;
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
      throw new RubicError('Trade is not available');
    }
    return new BigNumber(bestTrade.receivedCrypto);
  }
}
