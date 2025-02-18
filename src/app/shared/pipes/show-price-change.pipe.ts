import { Pipe, PipeTransform } from '@angular/core';
import { TokenAmount } from '../models/tokens/token-amount';
import {
  TOKEN_FILTERS,
  TokenFilter
} from '@app/features/trade/components/assets-selector/models/token-filters';
import BigNumber from 'bignumber.js';
import { AssetType } from '@app/features/trade/models/asset';
import { isTokenAmountWithPriceChange } from '../utils/is-token';

@Pipe({
  name: 'showPriceChange'
})
export class ShowPriceChangePipe implements PipeTransform {
  transform(token: TokenAmount, tokenFilter: TokenFilter, assetType: AssetType): number {
    if (assetType !== 'allChains') return null;
    if (
      tokenFilter !== TOKEN_FILTERS.ALL_CHAINS_GAINERS &&
      tokenFilter !== TOKEN_FILTERS.ALL_CHAINS_LOSERS
    ) {
      return null;
    }
    if (!isTokenAmountWithPriceChange(token)) return null;

    if (tokenFilter === TOKEN_FILTERS.ALL_CHAINS_LOSERS) {
      return new BigNumber(token.priceChange24h).dp(2).toNumber();
    }
    return new BigNumber(token.priceChange24h).dp(2).toNumber();
  }
}
