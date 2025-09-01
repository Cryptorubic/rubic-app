import { Injectable } from '@angular/core';
import { TokenAddress } from '@app/features/trade/components/assets-selector/services/tokens-list-service/models/tokens-list';
import { Token } from '@app/shared/models/tokens/token';
import { TokenAmount } from '@app/shared/models/tokens/token-amount';
import { isTokenAmount } from '@app/shared/utils/is-token';
import { compareAddresses } from '@app/shared/utils/utils';
import BigNumber from 'bignumber.js';
import { List } from 'immutable';
import { BLOCKCHAIN_NAME, EvmWeb3Pure } from '@cryptorubic/sdk';
import { StorageToken } from './models/storage-token';

@Injectable({
  providedIn: 'root'
})
export class TokenConvertersService {
  constructor() {}

  /**
   * from https://assets.rubic.exchange/assets/ethereum-pow/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48/logo.png
   * @returns ethereum-pow/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48/logo.png
   */
  public getTokenKeyInMap(t: Token | StorageToken): string {
    // show only one native token in selector for METIS
    if (
      t.address === BLOCKCHAIN_NAME.METIS &&
      (compareAddresses(t.address, EvmWeb3Pure.nativeTokenAddress) ||
        compareAddresses(t.address, '0xdeaddeaddeaddeaddeaddeaddeaddeaddead0000'))
    ) {
      return 'METIS_NATIVE';
    }

    if (t.image) {
      const splitted = t.image.split('/');
      const imgKey = splitted.slice(splitted.length - 3).join('/');
      return imgKey;
    }

    return `${t.address}_${t.blockchain}_${t.rank}_${t.name}_${t.type}`;
  }

  public convertTokensListToMap(
    tokensWithBalances: List<TokenAmount | Token | StorageToken>
  ): Map<TokenAddress, TokenAmount> {
    const tokensWithBalancesMap = new Map<TokenAddress, TokenAmount>();
    tokensWithBalances.forEach((t: TokenAmount | Token) => {
      if (isTokenAmount(t)) {
        tokensWithBalancesMap.set(this.getTokenKeyInMap(t), t);
      } else {
        const tokenAmount = { amount: new BigNumber(NaN), favorite: false, ...t } as TokenAmount;
        tokensWithBalancesMap.set(this.getTokenKeyInMap(tokenAmount), tokenAmount);
      }
    });

    return tokensWithBalancesMap;
  }

  /**
   * Sets default tokens params.
   * @param tokens Tokens list.
   * @param isFavorite Is tokens list favorite.
   */
  public getTokensWithNullBalances(tokens: List<Token>, isFavorite: boolean): List<TokenAmount> {
    return tokens.map(token => ({
      ...token,
      amount: new BigNumber(NaN),
      favorite: isFavorite
    }));
  }
}
