import { SwapResponseInterface } from '@app/core/services/sdk/sdk-legacy/features/ws-api/models/swap-response-interface';
import { BalanceToken } from '@app/shared/models/tokens/balance-token';
import {
  QuoteRequestInterface,
  QuoteResponseInterface,
  SwapRequestInterface
} from '@cryptorubic/core';
import { EvmTransactionConfig } from '@cryptorubic/web3';
import { BehaviorSubject } from 'rxjs';

export class HinkalWorkerQuoteService {
  private readonly _lastQuoteId$ = new BehaviorSubject<QuoteResponseInterface['id'] | null>(null);

  private readonly _lastQuoteParams$ = new BehaviorSubject<QuoteRequestInterface | null>(null);

  public get lastQuoteId(): QuoteResponseInterface['id'] {
    return this._lastQuoteId$.value;
  }

  public get lastQuoteParams(): QuoteRequestInterface {
    return this._lastQuoteParams$.value;
  }

  public async fetchQuote(
    fromAsset: BalanceToken,
    toAsset: BalanceToken,
    fromTokenStringAmount: string
  ): Promise<string> {
    const params: QuoteRequestInterface = {
      srcTokenAddress: fromAsset.address,
      srcTokenBlockchain: fromAsset.blockchain,
      srcTokenAmount: fromTokenStringAmount,
      dstTokenBlockchain: toAsset.blockchain,
      dstTokenAddress: toAsset.address,
      integratorAddress: '0x51c276f1392E87D4De6203BdD80c83f5F62724d4'
    };

    const { id, estimate } = (await fetch(
      'https://rubic-api-v2.rubic.exchange/api/routes/quoteBest',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(params)
      }
    ).then(v => v.json())) as QuoteResponseInterface;

    this._lastQuoteId$.next(id);
    this._lastQuoteParams$.next(params);

    return estimate.destinationWeiAmount;
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

    const resp = (await fetch('https://rubic-api-v2.rubic.exchange/api/routes/swap', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify(params)
    }).then(v => v.json())) as SwapResponseInterface<EvmTransactionConfig>;

    return resp.transaction;
  }
}
