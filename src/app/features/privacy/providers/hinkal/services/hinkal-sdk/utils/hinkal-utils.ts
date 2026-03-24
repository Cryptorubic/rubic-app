import { Token } from '@app/shared/models/tokens/token';
import { blockchainId, PriceToken, TokenAmount } from '@cryptorubic/core';
import { ERC20Token } from '@hinkal/common';
import { PureTokenAmount } from '../workers/models/worker-params';
export class HinkalUtils {
  public static convertRubicTokenToHinkalToken(
    token: Token | PriceToken | TokenAmount | PureTokenAmount
  ): ERC20Token {
    return {
      name: token.name,
      symbol: token.symbol,
      decimals: token.decimals,
      chainId: blockchainId[token.blockchain],
      erc20TokenAddress: token.address
    };
  }
}
