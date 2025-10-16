import { Pipe, PipeTransform } from '@angular/core';
import { TokenAmount } from '../models/tokens/token-amount';
import BigNumber from 'bignumber.js';
import { AssetListType } from '@app/features/trade/models/asset';
import { isTokenAmountWithPriceChange } from '../utils/is-token';

@Pipe({
  name: 'showPriceChange'
})
export class ShowPriceChangePipe implements PipeTransform {
  transform(token: TokenAmount, listType: AssetListType): number {
    if (listType !== 'allChains' && listType !== 'gainers' && listType !== 'losers') {
      return null;
    }
    if (!isTokenAmountWithPriceChange(token)) return null;

    if (listType === 'losers') {
      return new BigNumber(token.priceChange24h).dp(2).toNumber();
    }
    return new BigNumber(token.priceChange24h).dp(2).toNumber();
  }
}
