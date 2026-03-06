import { Injectable } from '@angular/core';
import { RubicApiService } from '@app/core/services/sdk/sdk-legacy/rubic-api/rubic-api.service';
import { BalanceToken } from '@app/shared/models/tokens/balance-token';
import {
  PriceTokenAmount,
  QuoteRequestInterface,
  QuoteResponseInterface,
  SwapRequestInterface
} from '@cryptorubic/core';
import { EvmTransactionConfig } from '@cryptorubic/web3';
import BigNumber from 'bignumber.js';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class HinkalQuoteService {
  private readonly _lastQuoteId$ = new BehaviorSubject<QuoteResponseInterface['id'] | null>(null);

  private readonly _lastQuoteParams$ = new BehaviorSubject<QuoteRequestInterface | null>(null);

  public get lastQuoteId(): QuoteResponseInterface['id'] {
    return this._lastQuoteId$.value;
  }

  public get lastQuoteParams(): QuoteRequestInterface {
    return this._lastQuoteParams$.value;
  }

  constructor(private readonly apiService: RubicApiService) {}

  public async fetchQuote(
    fromAsset: BalanceToken,
    toAsset: BalanceToken,
    fromTokenStringAmount: string
  ): Promise<PriceTokenAmount> {
    const params: QuoteRequestInterface = {
      srcTokenAddress: fromAsset.address,
      srcTokenBlockchain: fromAsset.blockchain,
      srcTokenAmount: fromTokenStringAmount,
      dstTokenBlockchain: toAsset.blockchain,
      dstTokenAddress: toAsset.address,
      integratorAddress: '0x51c276f1392E87D4De6203BdD80c83f5F62724d4'
    };

    const { tokens, id, estimate } = await this.apiService.fetchBestQuote(params);

    this._lastQuoteId$.next(id);
    this._lastQuoteParams$.next(params);

    const toTokenAmount = new PriceTokenAmount({
      ...tokens.to,
      price: new BigNumber(tokens.to.price || NaN),
      tokenAmount: estimate.destinationTokenAmount
    });

    return toTokenAmount;
  }

  public async fetchSwapData(fromAddress: string, receiver: string): Promise<EvmTransactionConfig> {
    if (!this.lastQuoteId || !this.lastQuoteParams) throw new Error('Invoke fetchQuote first');

    const params: SwapRequestInterface = {
      ...this.lastQuoteParams,
      id: this.lastQuoteId,
      fromAddress,
      enableChecks: false,
      receiver
    };

    const resp = await this.apiService.fetchSwapData<EvmTransactionConfig>(params);

    return resp.transaction;
  }
}
