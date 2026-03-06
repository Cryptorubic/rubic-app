import { PrivateQuoteAdapter } from '../models/quote-adapter';
import BigNumber from 'bignumber.js';

export class EmptyQuoteAdapter implements PrivateQuoteAdapter {
  public quoteCallback(): Promise<BigNumber> {
    return Promise.resolve(new BigNumber(0));
  }

  public quoteFallback(): Promise<BigNumber> {
    return Promise.resolve(new BigNumber(0));
  }
}
