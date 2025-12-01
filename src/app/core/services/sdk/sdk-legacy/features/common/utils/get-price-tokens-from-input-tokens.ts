import { BlockchainName, PriceToken, PriceTokenAmount, Token } from '@cryptorubic/core';
import BigNumber from 'bignumber.js';
import { TokenService } from '../../../token-service/token.service';

export async function getPriceTokensFromInputTokens<T extends BlockchainName = BlockchainName>(
  from:
    | Token<T>
    | {
        address: string;
        blockchain: T;
      }
    | PriceToken<T>,
  fromAmount: string | number | BigNumber,
  to:
    | Token<T>
    | string
    | {
        address: string;
        blockchain: T;
      }
    | PriceToken<T>,
  tokenService: TokenService
): Promise<{
  from: PriceTokenAmount<T>;
  to: PriceToken<T>;
}> {
  let fromPriceTokenPromise: Promise<PriceToken<T>>;

  if (from instanceof PriceToken) {
    fromPriceTokenPromise = new Promise(resolve => resolve(from));
  } else {
    fromPriceTokenPromise = tokenService.createPriceToken(from) as Promise<PriceToken<T>>;
  }

  let toPriceTokenPromise: Promise<PriceToken<T>>;

  if (to instanceof PriceToken) {
    toPriceTokenPromise = new Promise(resolve => resolve(to));
  } else if (to instanceof Token) {
    toPriceTokenPromise = tokenService.createPriceToken(to) as Promise<PriceToken<T>>;
  } else if (typeof to === 'object') {
    toPriceTokenPromise = tokenService.createPriceToken(to) as Promise<PriceToken<T>>;
  } else {
    toPriceTokenPromise = tokenService.createPriceToken({
      address: to as string,
      blockchain: from.blockchain
    }) as Promise<PriceToken<T>>;
  }

  const [fromPriceToken, toPriceToken] = await Promise.all([
    fromPriceTokenPromise,
    toPriceTokenPromise
  ]);

  const fromPriceTokenAmount = new PriceTokenAmount({
    ...fromPriceToken.asStructWithPrice,
    tokenAmount: new BigNumber(fromAmount)
  });

  return {
    from: fromPriceTokenAmount,
    to: toPriceToken
  };
}
