/// <reference lib="webworker" />

import { compareTokens } from '@app/shared/utils/utils';
import { TokenAmount } from 'rubic-sdk';

addEventListener('message', ({ data }) => {
  console.log('%cDATA ==> ', 'color: aqua;', data);
  const tokensWithBalances = data.allChainsTokens.map((token: TokenAmount) => {
    const foundTokenWithBalance = data.nullTokens.find((t: TokenAmount) => compareTokens(t, token));

    if (!foundTokenWithBalance) {
      return token;
    } else {
      return { ...token, amount: foundTokenWithBalance.amount };
    }
  });

  const response = { tokensWithBalances };

  console.log('%cRESPONSE ==> ', 'color: aqua;', response);
  postMessage(response);
});
