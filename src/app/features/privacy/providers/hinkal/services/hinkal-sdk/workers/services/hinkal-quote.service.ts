import { SwapResponseInterface } from '@app/core/services/sdk/sdk-legacy/features/ws-api/models/swap-response-interface';
import { BalanceToken } from '@app/shared/models/tokens/balance-token';
import {
  QuoteRequestInterface,
  QuoteResponseInterface,
  SwapRequestInterface
} from '@cryptorubic/core';
import { EvmTransactionConfig } from '@cryptorubic/web3';

export class HinkalWorkerQuoteService {
  private _lastQuoteId: QuoteResponseInterface['id'] | null = null;

  private _lastQuoteParams: QuoteRequestInterface | null = null;

  private readonly rubicUrl = 'https://rubic-api-v2.rubic.exchange/api/routes';

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

    const { id, estimate } = (await fetch(`${this.rubicUrl}/quoteBest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify(params)
    }).then(v => v.json())) as QuoteResponseInterface;

    this._lastQuoteId = id;
    this._lastQuoteParams = params;

    return estimate.destinationWeiAmount;
  }

  public async fetchSwapData(fromAddress: string, receiver: string): Promise<EvmTransactionConfig> {
    if (!this._lastQuoteId || !this._lastQuoteParams) throw new Error('Invoke fetchQuote first');

    const params: SwapRequestInterface = {
      ...this._lastQuoteParams,
      id: this._lastQuoteId,
      fromAddress,
      enableChecks: false,
      receiver
    };

    const resp = (await fetch(`${this.rubicUrl}/swap`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify(params)
    }).then(v => v.json())) as SwapResponseInterface<EvmTransactionConfig>;

    return resp.transaction;
  }
}
