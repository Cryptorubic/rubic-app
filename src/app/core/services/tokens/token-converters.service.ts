import { Injectable } from '@angular/core';
import { TokenAddress } from '@app/features/trade/components/assets-selector/services/tokens-list-service/models/tokens-list';
import { Token } from '@app/shared/models/tokens/token';
import { TokenAmount } from '@app/shared/models/tokens/token-amount';
import { isTokenAmount } from '@app/shared/utils/is-token';
import { compareAddresses } from '@app/shared/utils/utils';
import BigNumber from 'bignumber.js';
import { List } from 'immutable';
import { Web3Pure } from '@cryptorubic/web3';
import { StorageToken } from './models/storage-token';
import { BLOCKCHAIN_NAME } from '@cryptorubic/core';

@Injectable({
  providedIn: 'root'
})
export class TokenConvertersService {
  constructor() {}

  public getTokenKeyInMap(t: Token | StorageToken): string {
    // show only one native token in selector for METIS
    if (
      t.address === BLOCKCHAIN_NAME.METIS &&
      (compareAddresses(t.address, Web3Pure.getNativeTokenAddress(BLOCKCHAIN_NAME.METIS)) ||
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
