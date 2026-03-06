import { Token } from '@app/shared/models/tokens/token';
import { blockchainId, PriceToken, TokenAmount } from '@cryptorubic/core';
import { ERC20Token, UserKeys } from '@hinkal/common';

export class HinkalUtils {
  public static convertRubicTokenToHinkalToken(
    token: Token | PriceToken | TokenAmount
  ): ERC20Token {
    return {
      name: token.name,
      symbol: token.symbol,
      decimals: token.decimals,
      chainId: blockchainId[token.blockchain],
      erc20TokenAddress: token.address
    };
  }

  public static getPrivateAddress(shieldedPrivateKey: string): string {
    const s = BigInt(Date.now());
    const { stealthAddress, encryptionKey } = UserKeys.getStealthAddressWithEKey(
      s,
      shieldedPrivateKey
    );

    const { h0, h1 } = UserKeys.getStealthAddressCompressedPoints(s, shieldedPrivateKey);

    return `${s},${stealthAddress},${encryptionKey},${h0},${h1}`;
  }
}
