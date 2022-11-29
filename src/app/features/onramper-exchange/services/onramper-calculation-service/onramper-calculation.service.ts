import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { onramperApiKey } from '@features/onramper-exchange/constants/onramper-api-key';
import { OnramperRateResponse } from '@features/onramper-exchange/services/onramper-calculation-service/models/onramper-rate-response';
import { firstValueFrom } from 'rxjs';
import BigNumber from 'bignumber.js';
import { ExchangerFormService } from '@features/onramper-exchange/services/exchanger-form-service/exchanger-form.service';
import { ExchangerFormInput } from '@features/onramper-exchange/services/exchanger-form-service/models/exchanger-form';
import { EvmWeb3Pure, OnChainTrade } from 'rubic-sdk';
import { RubicSdkService } from '@features/swaps/core/services/rubic-sdk-service/rubic-sdk.service';

@Injectable({
  providedIn: 'root'
})
export class OnramperCalculationService {
  constructor(
    private readonly httpClient: HttpClient,
    private readonly exchangerFormService: ExchangerFormService,
    private readonly sdkService: RubicSdkService
  ) {
    this.exchangerFormService.input$.subscribe(input => {
      if (input.fromFiat && input.toToken && input.fromAmount?.isFinite()) {
        this.setOutputTokenAmount(input);
      }
    });
  }

  private async setOutputTokenAmount(input: ExchangerFormInput): Promise<void> {
    const receivedNativeAmount = await this.getOutputNativeAmount(input.fromAmount);
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
    const bestTrade = onChainTrades[0];
    const outputAmount =
      bestTrade instanceof OnChainTrade ? bestTrade.to.tokenAmount : new BigNumber(NaN);
    this.exchangerFormService.output.patchValue({
      toAmount: outputAmount
    });
  }

  private async getOutputNativeAmount(fromAmount: BigNumber): Promise<BigNumber> {
    const trades = await firstValueFrom(
      this.httpClient.get<OnramperRateResponse>(
        `https://onramper.tech/rate/USD/ETH/creditCard/${fromAmount.toFixed()}`,
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
