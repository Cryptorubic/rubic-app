import { TokenAddress } from '@app/features/trade/components/assets-selector/services/tokens-list-service/models/tokens-list';
import { Token } from '@app/shared/models/tokens/token';
import { TokenAmount } from '@app/shared/models/tokens/token-amount';
import { isNativeAddressSafe } from '@app/shared/utils/is-native-address-safe';
import BigNumber from 'bignumber.js';
import { List } from 'immutable';

export function getTokenKeyInMap(t: TokenAmount): string {
  return `${t.symbol}_${t.image ?? ''}_${t.address.toLowerCase()}_${t.rank}_${t.price}_${
    t.blockchain
  }`;
}

export function convertTokensListToMap(
  tokensWithBalances: List<TokenAmount>
): Map<TokenAddress, TokenAmount> {
  const tokensWithBalancesMap = new Map<TokenAddress, TokenAmount>();
  tokensWithBalances.forEach(t => {
    if (isNativeAddressSafe(t)) {
      tokensWithBalancesMap.set(getTokenKeyInMap(t), t);
    } else {
      tokensWithBalancesMap.set(t.address.toLowerCase(), t);
    }
  });

  return tokensWithBalancesMap;
}

/**
 * Sets default tokens params.
 * @param tokens Tokens list.
 * @param isFavorite Is tokens list favorite.
 */
export function getTokensWithNullBalances(
  tokens: List<Token>,
  isFavorite: boolean
): List<TokenAmount> {
  return tokens.map(token => ({
    ...token,
    amount: new BigNumber(NaN),
    favorite: isFavorite
  }));
}
