import { AssetListType } from '@app/features/trade/models/asset';
import { MinimalToken } from '@app/shared/models/tokens/minimal-token';
import {
  PRIVACYCASH_SUPPORTED_TOKENS,
  PrivacycashSupportedChain
} from '../../../../constants/chains';
import { BlockchainName, BlockchainsInfo } from '@cryptorubic/core';

export function getMinimalTokensByChain(type: AssetListType): MinimalToken[] {
  return BlockchainsInfo.isBlockchainName(type)
    ? PRIVACYCASH_SUPPORTED_TOKENS[type as PrivacycashSupportedChain].map(tokenAddr => ({
        address: tokenAddr,
        blockchain: type
      }))
    : Object.entries(PRIVACYCASH_SUPPORTED_TOKENS)
        .map(([chain, tokenAddresses]: [BlockchainName, string[]]) =>
          tokenAddresses.map(
            tokenAddr => ({ address: tokenAddr, blockchain: chain } as MinimalToken)
          )
        )
        .flat();
}

export function convertAddressesConfigToMinimalTokenMap(): Record<
  PrivacycashSupportedChain,
  MinimalToken[]
> {
  return Object.entries(PRIVACYCASH_SUPPORTED_TOKENS).reduce((acc, [chain, tokenAddresses]) => {
    acc[chain as PrivacycashSupportedChain] = tokenAddresses.map(
      tokenAddr => ({ address: tokenAddr, blockchain: chain } as MinimalToken)
    );
    return acc;
  }, {} as Record<PrivacycashSupportedChain, MinimalToken[]>);
}

export function getTokenKey(token: MinimalToken): string {
  return `${token.blockchain}::${token.address.toLowerCase()}`;
}
